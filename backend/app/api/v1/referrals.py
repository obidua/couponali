from fastapi import APIRouter

router = APIRouter(prefix="/referrals", tags=["Engagement"])


@router.get("/my-code", response_model=dict)
def my_code():
    return {
        "success": True,
        "data": {
            "referral_code": "USER123",
            "referral_link": "https://yourcoupondomain.com/signup?ref=USER123",
            "total_referrals": 15,
            "active_referrals": 12,
            "total_earned": 1250.00,
            "pending_earnings": 340.00,
        },
    }


@router.get("/my-referrals", response_model=dict)
def my_referrals():
    return {
        "success": True,
        "data": {
            "referrals": [
                {
                    "id": 10,
                    "referred_user": {"full_name": "Jane Doe", "joined_at": "2025-10-15T10:00:00Z"},
                    "status": "active",
                    "total_earned": 450.00,
                    "activated_at": "2025-10-16T12:00:00Z",
                }
            ],
            "pagination": {"current_page": 1, "total_pages": 1, "total_items": 1, "per_page": 20},
        },
    }
