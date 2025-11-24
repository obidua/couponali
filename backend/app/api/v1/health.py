"""Health check and monitoring endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from ...database import get_db
from ...queue import get_queue_stats
from ...redis_client import redis_client

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check(db: Session = Depends(get_db)):
    """Basic health check for API and database"""
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "service": "coupon-commerce-api"
    }


@router.get("/redis")
async def redis_health():
    """Redis health check with queue statistics"""
    try:
        # Ping Redis
        redis_client.ping()
        
        # Get queue statistics
        stats = get_queue_stats(redis_client)
        
        return {
            "status": "healthy",
            "redis": "connected",
            "queues": {
                "email": {
                    "pending": stats.get("email_pending", 0),
                    "processing": stats.get("email_processing", 0),
                    "dead_letter": stats.get("email_dead_letter", 0)
                },
                "sms": {
                    "pending": stats.get("sms_pending", 0),
                    "processing": stats.get("sms_processing", 0),
                    "dead_letter": stats.get("sms_dead_letter", 0)
                }
            },
            "total": {
                "pending": stats.get("total_pending", 0),
                "processing": stats.get("total_processing", 0),
                "dead_letter": stats.get("total_dead_letter", 0)
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "redis": f"error: {str(e)}",
            "queues": None
        }
