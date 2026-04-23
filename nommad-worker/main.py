import asyncio
import io
import json
import logging
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from PIL import Image

import comfy
import supa
from sig import verify, sign
from config import (
    WORKER_ID,
    WORKER_NAME,
    WORKER_PORT,
    VERCEL_API_BASE,
    tailnet_url,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("nommad-worker")

app = FastAPI()
JOB_QUEUE: asyncio.Queue = asyncio.Queue()
CURRENT_JOB: dict | None = None


class JobIn(BaseModel):
    job_id: str
    user_id: str
    workflow_slug: str
    type: str
    params: dict


@app.get("/health")
def health():
    return {"ok": True, "worker_id": WORKER_ID, "busy": CURRENT_JOB is not None}


@app.post("/jobs")
async def accept_job(req: Request):
    raw = await req.body()
    sig = req.headers.get("x-nommad-sig")
    if not verify(raw, sig):
        raise HTTPException(status_code=401, detail="Invalid signature")
    job = JobIn.model_validate_json(raw)
    await JOB_QUEUE.put(job.model_dump())
    log.info("queued job %s (%s)", job.job_id, job.workflow_slug)
    return {"accepted": True, "queue_depth": JOB_QUEUE.qsize()}


def make_thumbnail(png: bytes, size: int = 512) -> bytes:
    im = Image.open(io.BytesIO(png)).convert("RGB")
    im.thumbnail((size, size))
    out = io.BytesIO()
    im.save(out, format="PNG", optimize=True)
    return out.getvalue()


async def run_job(job: dict) -> None:
    global CURRENT_JOB
    CURRENT_JOB = job
    job_id = job["job_id"]
    try:
        log.info("starting job %s", job_id)
        workflow_row = supa.fetch_workflow(job["workflow_slug"])
        injected = comfy.inject_params(workflow_row["comfy_json"], job["params"])

        supa.mark_running(job_id, WORKER_ID)

        last_progress = 0
        loop = asyncio.get_running_loop()

        def on_progress(p: int):
            nonlocal last_progress
            if p - last_progress < 5:
                return
            last_progress = p
            # Fire-and-forget — não bloqueia WS.
            loop.create_task(asyncio.to_thread(supa.update_job, job_id, progress=p))

        _, png = await comfy.run(injected, on_progress=on_progress)

        thumb = make_thumbnail(png)
        result_url = supa.upload_png(job["user_id"], job_id, png)
        thumb_url = supa.upload_png(job["user_id"], job_id, thumb, suffix="_thumb")
        supa.mark_done(job_id, result_url, thumb_url)
        log.info("done job %s", job_id)
    except Exception as e:
        log.exception("job %s failed", job_id)
        try:
            supa.mark_error(job_id, str(e))
        except Exception:
            pass
    finally:
        CURRENT_JOB = None


async def worker_loop():
    while True:
        job = await JOB_QUEUE.get()
        try:
            await run_job(job)
        finally:
            JOB_QUEUE.task_done()


async def heartbeat_loop():
    url = f"{VERCEL_API_BASE}/api/design/workers/heartbeat"
    async with httpx.AsyncClient(timeout=10) as http:
        while True:
            try:
                vram_mb, vram_free_mb = read_vram()
                body = json.dumps({
                    "worker_id": WORKER_ID,
                    "name": WORKER_NAME,
                    "tailnet_url": tailnet_url(),
                    "vram_mb": vram_mb,
                    "vram_free_mb": vram_free_mb,
                    "status": "busy" if CURRENT_JOB else "online",
                }).encode()
                headers = {"content-type": "application/json", "x-nommad-sig": sign(body)}
                r = await http.post(url, content=body, headers=headers)
                if r.status_code >= 400:
                    log.warning("heartbeat %s: %s", r.status_code, r.text[:200])
            except Exception as e:
                log.warning("heartbeat error: %s", e)
            await asyncio.sleep(30)


async def orphan_rescue_loop():
    """Se o worker reiniciou com jobs 'dispatched' pendurados nele, re-enfileira."""
    await asyncio.sleep(5)
    while True:
        try:
            rows = supa.orphan_jobs(WORKER_ID)
            for r in rows:
                log.info("rescuing orphan job %s", r["id"])
                await JOB_QUEUE.put({
                    "job_id": r["id"],
                    "user_id": r["user_id"],
                    "workflow_slug": r["workflow_slug"],
                    "type": r["type"],
                    "params": r["params"] or {},
                })
        except Exception as e:
            log.warning("orphan-rescue error: %s", e)
        await asyncio.sleep(120)


def read_vram() -> tuple[int | None, int | None]:
    try:
        import pynvml
        pynvml.nvmlInit()
        h = pynvml.nvmlDeviceGetHandleByIndex(0)
        info = pynvml.nvmlDeviceGetMemoryInfo(h)
        return int(info.total // (1024 * 1024)), int(info.free // (1024 * 1024))
    except Exception:
        return None, None


@app.on_event("startup")
async def on_startup():
    asyncio.create_task(worker_loop())
    asyncio.create_task(heartbeat_loop())
    asyncio.create_task(orphan_rescue_loop())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=WORKER_PORT, log_level="info")
