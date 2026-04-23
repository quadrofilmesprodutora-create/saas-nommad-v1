import asyncio
import json
import uuid
import httpx
import websockets
from config import COMFY_URL


def inject_params(workflow: dict, params: dict) -> dict:
    """Substitui strings "{{key}}" dentro dos inputs do workflow ComfyUI
    pelos valores em `params`. ComfyUI API format é um dict de nodes —
    cada node tem `inputs: {...}` com valores literais.
    """
    def walk(obj):
        if isinstance(obj, dict):
            return {k: walk(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [walk(v) for v in obj]
        if isinstance(obj, str):
            s = obj
            for key, val in params.items():
                token = "{{" + key + "}}"
                if token in s:
                    # Se substituição consome a string inteira e valor é número, preserva tipo
                    if s == token and isinstance(val, (int, float)):
                        return val
                    s = s.replace(token, str(val))
            return s
        return obj

    return walk(workflow)


async def run(
    workflow: dict,
    on_progress=None,
) -> tuple[str, bytes]:
    """Submete workflow ao ComfyUI, escuta WS, retorna (filename, png bytes) final.
    on_progress(percent:int) chamado durante execução.
    """
    client_id = str(uuid.uuid4())
    async with httpx.AsyncClient(base_url=COMFY_URL, timeout=30) as http:
        resp = await http.post("/prompt", json={"prompt": workflow, "client_id": client_id})
        resp.raise_for_status()
        prompt_id = resp.json()["prompt_id"]

    ws_url = COMFY_URL.replace("http", "ws") + f"/ws?clientId={client_id}"
    done_filename: str | None = None
    done_subfolder: str = ""
    async with websockets.connect(ws_url, max_size=None) as ws:
        async for msg in ws:
            if isinstance(msg, bytes):
                continue
            data = json.loads(msg)
            t = data.get("type")
            d = data.get("data", {})
            if d.get("prompt_id") and d["prompt_id"] != prompt_id:
                continue
            if t == "progress" and on_progress:
                value = d.get("value", 0)
                maxv = d.get("max", 1) or 1
                try:
                    on_progress(int(value / maxv * 90) + 5)
                except Exception:
                    pass
            if t == "executed":
                images = (d.get("output") or {}).get("images") or []
                if images:
                    done_filename = images[0]["filename"]
                    done_subfolder = images[0].get("subfolder", "")
            if t == "execution_error":
                raise RuntimeError(d.get("exception_message") or "ComfyUI execution error")
            if t == "status":
                q = (d.get("status") or {}).get("exec_info", {}).get("queue_remaining", 1)
                if q == 0 and done_filename:
                    break

    if not done_filename:
        raise RuntimeError("ComfyUI finished without producing an image")

    async with httpx.AsyncClient(base_url=COMFY_URL, timeout=30) as http:
        resp = await http.get(
            "/view",
            params={"filename": done_filename, "subfolder": done_subfolder, "type": "output"},
        )
        resp.raise_for_status()
        return done_filename, resp.content
