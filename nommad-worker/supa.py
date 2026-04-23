from datetime import datetime, timezone
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET

_client: Client | None = None


def client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


def update_job(job_id: str, **fields) -> None:
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    client().table("design_jobs").update(fields).eq("id", job_id).execute()


def mark_running(job_id: str, worker_id: str, comfy_prompt_id: str | None = None) -> None:
    update_job(
        job_id,
        status="running",
        worker_id=worker_id,
        comfy_prompt_id=comfy_prompt_id,
        started_at=datetime.now(timezone.utc).isoformat(),
        progress=1,
    )


def mark_done(job_id: str, result_url: str, thumbnail_url: str | None) -> None:
    update_job(
        job_id,
        status="done",
        result_url=result_url,
        thumbnail_url=thumbnail_url or result_url,
        progress=100,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )


def mark_error(job_id: str, message: str) -> None:
    update_job(
        job_id,
        status="error",
        error=message[:500],
        finished_at=datetime.now(timezone.utc).isoformat(),
    )


def upload_png(user_id: str, job_id: str, data: bytes, suffix: str = "") -> str:
    path = f"{user_id}/{job_id}{suffix}.png"
    bucket = client().storage.from_(SUPABASE_BUCKET)
    # upsert=True pra re-runs
    bucket.upload(path, data, {"content-type": "image/png", "upsert": "true"})
    # bucket é privado → gera signed URL válida por 7 dias
    signed = bucket.create_signed_url(path, 7 * 24 * 3600)
    return signed.get("signedURL") or signed.get("signed_url") or ""


def fetch_workflow(slug: str) -> dict:
    res = (
        client()
        .table("design_workflows")
        .select("slug, type, name, comfy_json, param_schema, defaults")
        .eq("slug", slug)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    if not rows:
        raise RuntimeError(f"workflow '{slug}' not found")
    return rows[0]


def orphan_jobs(worker_id: str) -> list[dict]:
    """Jobs com status 'dispatched' assigned a este worker mas nunca rodaram
    (queda de rede/reboot no meio do dispatch)."""
    res = (
        client()
        .table("design_jobs")
        .select("id, user_id, workflow_slug, type, params")
        .eq("worker_id", worker_id)
        .eq("status", "dispatched")
        .execute()
    )
    return res.data or []
