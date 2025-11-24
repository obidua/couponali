"""Simple worker for processing email & SMS jobs from Redis queues.

This is a synchronous prototype; in production you would likely:
- Run multiple processes / containers for scaling
- Integrate proper templating & provider SDKs (SendGrid, SMS gateway)
- Add exponential backoff & retry limits
- Emit metrics / structured logs

Usage:
    python -m workers.email_sms_worker

Graceful shutdown is best-effort using KeyboardInterrupt.
"""
from __future__ import annotations
import json
import time
from datetime import datetime, timezone
from typing import Callable
from app.redis_client import redis_client, rk

EMAIL_QUEUE = rk("queue", "email")
SMS_QUEUE = rk("queue", "sms")
EMAIL_PROCESSING = rk("queue", "email", "processing")
SMS_PROCESSING = rk("queue", "sms", "processing")
EMAIL_DLQ = rk("queue", "email", "dlq")
SMS_DLQ = rk("queue", "sms", "dlq")

MAX_ATTEMPTS = 3
POLL_TIMEOUT_SECONDS = 2  # BLPOP timeout


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _process_email(job: dict) -> None:
    """Fake email send handler; replace with provider integration."""
    # Example simulation: always succeed for now
    time.sleep(0.01)  # mimic network I/O


def _process_sms(job: dict) -> None:
    """Fake SMS send handler; replace with provider integration."""
    time.sleep(0.005)


HANDLERS: dict[str, Callable[[dict], None]] = {
    "email": _process_email,
    "sms": _process_sms,
}


def _fail_job(queue_name: str, raw_job: str, job: dict, error_msg: str) -> None:
    job["error"] = error_msg
    job["failedAt"] = _now_iso()
    job["attempts"] = job.get("attempts", 0) + 1
    # Push into DLQ or discard if attempts exceeded
    if job["attempts"] < MAX_ATTEMPTS:
        redis_client.rpush(rk("queue", queue_name, "dlq"), json.dumps(job))
    else:
        # Could archive permanently; here we still put into DLQ for inspection.
        redis_client.rpush(rk("queue", queue_name, "dlq"), json.dumps(job))


def _work_single(queue_name: str, queue_key: str, processing_key: str) -> None:
    popped = redis_client.blpop(queue_key, timeout=POLL_TIMEOUT_SECONDS)
    if not popped:
        return
    _, raw_job = popped
    job = json.loads(raw_job)
    # Add to processing set
    redis_client.sadd(processing_key, raw_job)
    try:
        HANDLERS[queue_name](job)
    except Exception as exc:  # noqa: BLE001
        _fail_job(queue_name, raw_job, job, str(exc))
    else:
        # Success path could emit metrics/logs
        pass
    finally:
        redis_client.srem(processing_key, raw_job)


def run_forever() -> None:
    print("[worker] Starting email/SMS worker loop")
    try:
        while True:
            _work_single("email", EMAIL_QUEUE, EMAIL_PROCESSING)
            _work_single("sms", SMS_QUEUE, SMS_PROCESSING)
    except KeyboardInterrupt:
        print("[worker] Shutdown requested; exiting.")


if __name__ == "__main__":
    run_forever()
