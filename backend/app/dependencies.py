from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from .config import get_settings
from .database import get_db
from .redis_client import rk, cache_get
from .models import User

settings = get_settings()

def get_current_user(db: Session = Depends(get_db), authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split()[1]
    # Fast path: check Redis session
    session = cache_get(rk("session", token))
    if session and isinstance(session, dict) and "user" in session:
        # Minimal user object reconstruction (no DB hit). If you need fresh data remove this optimization.
        user_payload = session["user"]
        user = db.query(User).filter(User.id == user_payload["id"]).first()
        if user:
            return user
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return user
