"""Synchronous Redis helper plus higher-level utilities.
For advanced async patterns see docs/08-REDIS-ARCHITECTURE.md; this keeps
integration simple with existing sync endpoints while exposing core features.
"""
import json
import time
from typing import Any, Callable
import redis
from .config import get_settings

settings = get_settings()

redis_client = redis.Redis.from_url(
	settings.REDIS_URL,
	decode_responses=True,
	socket_timeout=1.5,
	socket_connect_timeout=1.5,
	health_check_interval=30,
	retry_on_timeout=True,
)

# Key helpers
def rk(*parts: str) -> str:
	"""Compose hierarchical Redis keys using colon naming."""
	return ":".join(parts)

# Basic cache helpers
def cache_get(key: str) -> Any:
	raw = redis_client.get(key)
	if raw is None:
		return None
	try:
		return json.loads(raw)
	except Exception:
		return raw

def cache_set(key: str, value: Any, ttl: int) -> None:
	if isinstance(value, (dict, list)):
		redis_client.setex(key, ttl, json.dumps(value))
	else:
		redis_client.setex(key, ttl, str(value))

def cache_invalidate(key: str) -> None:
	redis_client.delete(key)

# Rate limiting (fixed window)
def rate_limit(identifier: str, limit: int, window_seconds: int) -> tuple[bool, int, int]:
	"""Increment counter for identifier; return (allowed, remaining, ttl)."""
	key = rk("rate_limit", identifier)
	pipe = redis_client.pipeline()
	pipe.incr(key, 1)
	pipe.ttl(key)
	results = pipe.execute()
	count, ttl = results
	if ttl == -1:
		redis_client.expire(key, window_seconds)
		ttl = window_seconds
	allowed = count <= limit
	remaining = max(0, limit - count)
	return allowed, remaining, ttl

# Offer click tracking + trending
def track_offer_click(offer_id: int, user_id: int | None = None) -> None:
	redis_client.incr(rk("offer", str(offer_id), "clicks"))
	redis_client.zincrby(rk("offers", "trending"), 1, str(offer_id))
	if user_id:
		redis_client.sadd(rk("offer", str(offer_id), "viewers"), str(user_id))

def get_trending_offer_ids(limit: int = 10) -> list[int]:
	ids = redis_client.zrevrange(rk("offers", "trending"), 0, limit - 1)
	return [int(i) for i in ids]

# Simple distributed lock (best-effort, non-blocking)
def acquire_lock(name: str, ttl: int = 10) -> bool:
	key = rk("lock", name)
	return bool(redis_client.set(key, str(time.time()), nx=True, ex=ttl))

def release_lock(name: str) -> None:
	redis_client.delete(rk("lock", name))

# Leaderboard (referrals)
def leaderboard_increment(user_id: int, earnings: float) -> None:
	redis_client.zincrby(rk("leaderboard", "referrals"), earnings, str(user_id))

def leaderboard_top(limit: int = 10) -> list[tuple[int, float]]:
	rows = redis_client.zrevrange(rk("leaderboard", "referrals"), 0, limit - 1, withscores=True)
	return [(int(uid), score) for uid, score in rows]

# Monitoring snapshot
def redis_stats() -> dict:
	info = redis_client.info()
	hits = info.get("keyspace_hits", 0)
	misses = info.get("keyspace_misses", 0)
	hit_rate = (hits / (hits + misses)) * 100 if (hits + misses) else 0.0
	return {
		"connected_clients": info.get("connected_clients"),
		"used_memory_human": info.get("used_memory_human"),
		"total_commands_processed": info.get("total_commands_processed"),
		"cache_hit_rate_percent": round(hit_rate, 2),
	}

def cached(fn: Callable, key_builder: Callable[..., str], ttl: int):
	"""Decorator style manual helper for caching pure function results."""
	def wrapper(*args, **kwargs):
		key = key_builder(*args, **kwargs)
		val = cache_get(key)
		if val is not None:
			return val
		val = fn(*args, **kwargs)
		cache_set(key, val, ttl)
		return val
	return wrapper
