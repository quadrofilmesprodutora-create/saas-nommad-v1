import os
from dotenv import load_dotenv

load_dotenv()

WORKER_ID = os.environ["WORKER_ID"]
WORKER_NAME = os.environ.get("WORKER_NAME", "worker")
WORKER_SHARED_SECRET = os.environ["WORKER_SHARED_SECRET"].encode()
WORKER_PORT = int(os.environ.get("WORKER_PORT", "7777"))

COMFY_URL = os.environ.get("COMFY_URL", "http://127.0.0.1:8188").rstrip("/")

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "design-assets")

VERCEL_API_BASE = os.environ["VERCEL_API_BASE"].rstrip("/")

UPSCALE_ENABLED = os.environ.get("UPSCALE_ENABLED", "true").lower() == "true"


def tailnet_url() -> str:
    """Returns how the Vercel API will reach this worker.
    Em produção vem do Tailscale Funnel. Caiu aqui porque o worker PRECISA
    saber a própria URL pública pra registrar no heartbeat.
    """
    return os.environ.get("WORKER_PUBLIC_URL", f"http://127.0.0.1:{WORKER_PORT}")
