from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, EmailStr, Field
from ...security import create_access_token
from ...redis_client import rk, cache_set, cache_get, cache_invalidate
import json, time

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    email: EmailStr | None = None
    mobile: str | None = None
    password: str
    full_name: str | None = None
    referral_code: str | None = None


class RegisterResponse(BaseModel):
    success: bool = True
    message: str
    data: dict


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or mobile")
    password: str


class TokenBundle(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user: dict


class OTPRequest(BaseModel):
    mobile: str
    purpose: str


class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str
    otp_id: str


class SocialLoginRequest(BaseModel):
    provider: str
    access_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse)
def register(payload: RegisterRequest):
    # Stubbed response to mirror the API specification
    return RegisterResponse(
        message="User registered successfully. Please verify your email/mobile.",
        data={
            "user_id": 123,
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "email": payload.email or "user@example.com",
            "mobile": payload.mobile or "+919876543210",
            "referral_code": payload.referral_code or "USER123",
        },
    )


@router.post("/login", response_model=dict)
def login(payload: LoginRequest):
    if not payload.identifier or not payload.password:
        raise HTTPException(status_code=400, detail="Missing credentials")

    user_data = {
        "id": 123,
        "email": "user@example.com",
        "full_name": "John Doe",
        "wallet_balance": 1250.50,
        "pending_cashback": 340.00,
    }
    access_token = create_access_token("123")
    session_key = rk("session", access_token)
    session_payload = {"user": user_data, "login_at": int(time.time())}
    cache_set(session_key, session_payload, 86400)  # 24h
    return {"success": True, "data": TokenBundle(access_token=access_token, refresh_token="refresh_mock_token", expires_in=3600, user=user_data).model_dump()}


@router.post("/request-otp", response_model=dict)
def request_otp(payload: OTPRequest):
    return {
        "success": True,
        "message": "OTP sent successfully",
        "data": {"otp_id": "otp_abc123", "expires_in": 300},
    }


@router.post("/verify-otp", response_model=dict)
def verify_otp(payload: VerifyOTPRequest):
    # Reuse login-style response
    return {
        "success": True,
        "data": {
            "access_token": create_access_token("123"),
            "refresh_token": "refresh_mock_token",
            "expires_in": 3600,
            "user": {
                "id": 123,
                "email": "user@example.com",
                "full_name": "John Doe",
                "wallet_balance": 1250.50,
                "pending_cashback": 340.00,
            },
        },
    }


@router.post("/social-login", response_model=dict)
def social_login(payload: SocialLoginRequest):
    if payload.provider not in {"google", "facebook"}:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    return {
        "success": True,
        "data": {
            "access_token": create_access_token("social_user"),
            "refresh_token": "refresh_mock_token",
            "expires_in": 3600,
            "user": {
                "id": 999,
                "email": "social@example.com",
                "full_name": "Social User",
                "wallet_balance": 0.0,
                "pending_cashback": 0.0,
            },
        },
    }


@router.post("/refresh-token", response_model=dict)
def refresh_token(payload: RefreshRequest):
    return {"success": True, "data": {"access_token": create_access_token("123"), "expires_in": 3600}}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    cache_invalidate(rk("session", token))
    return
