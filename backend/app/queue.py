"""Queue management for background jobs using Redis.

This module provides functions to push jobs to Redis queues that are processed
by Bun worker services (email-worker, sms-worker, cashback-sync).
"""
import json
import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from .redis_client import redis_client, rk


def push_email_job(
    email_type: str,
    to_email: str,
    data: Dict[str, Any],
    job_id: Optional[str] = None
) -> str:
    """
    Push an email job to the Redis queue.
    
    Args:
        email_type: Type of email (welcome, order_confirmation, cashback_confirmed, withdrawal_processed)
        to_email: Recipient email address
        data: Template data for the email
        job_id: Optional job ID (generated if not provided)
        
    Returns:
        Job ID
        
    Example:
        push_email_job(
            "order_confirmation",
            "user@example.com",
            {
                "user_name": "John",
                "order_number": "ORD-12345",
                "total_amount": 1500,
                "items_count": 3,
                "order_url": "https://app.com/orders/ORD-12345"
            }
        )
    """
    if not job_id:
        job_id = f"email_{uuid.uuid4().hex[:12]}"
    
    job = {
        "id": job_id,
        "type": email_type,
        "to": to_email,
        "data": data,
        "attempts": 0,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    # Push to queue
    redis_client.rpush(rk("queue", "email"), json.dumps(job))
    
    return job_id


def push_sms_job(
    sms_type: str,
    mobile: str,
    data: Dict[str, Any],
    job_id: Optional[str] = None
) -> str:
    """
    Push an SMS job to the Redis queue.
    
    Args:
        sms_type: Type of SMS (otp, order_confirmation, cashback_credited, withdrawal_processed)
        mobile: Recipient mobile number (with country code)
        data: Template data for the SMS
        job_id: Optional job ID (generated if not provided)
        
    Returns:
        Job ID
        
    Example:
        push_sms_job(
            "otp",
            "+919876543210",
            {"otp": "123456"}
        )
    """
    if not job_id:
        job_id = f"sms_{uuid.uuid4().hex[:12]}"
    
    job = {
        "id": job_id,
        "type": sms_type,
        "mobile": mobile,
        "data": data,
        "attempts": 0,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    # Push to queue
    redis_client.rpush(rk("queue", "sms"), json.dumps(job))
    
    return job_id


def push_cashback_sync_job(
    affiliate_network: str,
    data: Dict[str, Any],
    job_id: Optional[str] = None
) -> str:
    """
    Push a cashback sync job to the Redis queue.
    
    Args:
        affiliate_network: Network name (admitad, vcommission, cuelinks)
        data: Sync data
        job_id: Optional job ID (generated if not provided)
        
    Returns:
        Job ID
    """
    if not job_id:
        job_id = f"cashback_{uuid.uuid4().hex[:12]}"
    
    job = {
        "id": job_id,
        "network": affiliate_network,
        "data": data,
        "attempts": 0,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    # Push to queue
    redis_client.rpush(rk("queue", "cashback"), json.dumps(job))
    
    return job_id


def get_queue_stats() -> Dict[str, Any]:
    """Get statistics for all queues."""
    return {
        "email": {
            "pending": redis_client.llen(rk("queue", "email")),
            "processing": redis_client.scard(rk("queue", "email", "processing")),
            "dead_letter": redis_client.llen(rk("queue", "email", "dlq")),
        },
        "sms": {
            "pending": redis_client.llen(rk("queue", "sms")),
            "processing": redis_client.scard(rk("queue", "sms", "processing")),
            "dead_letter": redis_client.llen(rk("queue", "sms", "dlq")),
        },
        "cashback": {
            "pending": redis_client.llen(rk("queue", "cashback")),
            "processing": redis_client.scard(rk("queue", "cashback", "processing")),
            "dead_letter": redis_client.llen(rk("queue", "cashback", "dlq")),
        }
    }


def get_dead_letter_jobs(queue_name: str, start: int = 0, limit: int = 100) -> list:
    """Get failed jobs from dead letter queue."""
    dlq_key = rk("queue", queue_name, "dlq")
    jobs = redis_client.lrange(dlq_key, start, start + limit - 1)
    return [json.loads(job) for job in jobs]


def retry_dead_letter_job(queue_name: str, index: int) -> bool:
    """Retry a specific job from the dead letter queue."""
    dlq_key = rk("queue", queue_name, "dlq")
    queue_key = rk("queue", queue_name)
    
    # Get the job
    job_data = redis_client.lindex(dlq_key, index)
    if not job_data:
        return False
    
    # Parse and reset attempts
    job = json.loads(job_data)
    job["attempts"] = 0
    job.pop("failedAt", None)
    job.pop("error", None)
    
    # Remove from DLQ and push to main queue
    redis_client.lrem(dlq_key, 1, job_data)
    redis_client.rpush(queue_key, json.dumps(job))
    
    return True


def clear_dead_letter_queue(queue_name: str) -> int:
    """Clear all jobs from a dead letter queue. Returns number of jobs cleared."""
    dlq_key = rk("queue", queue_name, "dlq")
    count = redis_client.llen(dlq_key)
    redis_client.delete(dlq_key)
    return count
