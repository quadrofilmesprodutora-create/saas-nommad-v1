import hmac
import hashlib
from config import WORKER_SHARED_SECRET


def sign(body: bytes) -> str:
    return hmac.new(WORKER_SHARED_SECRET, body, hashlib.sha256).hexdigest()


def verify(body: bytes, signature: str | None) -> bool:
    if not signature:
        return False
    expected = sign(body)
    try:
        return hmac.compare_digest(expected, signature)
    except Exception:
        return False
