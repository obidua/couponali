from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/wallet", tags=["Wallet"])


class TransactionFilters(BaseModel):
    page: int = 1
    limit: int = 20
    type: str | None = None
    from_date: str | None = None
    to_date: str | None = None


class MissingCashbackRequest(BaseModel):
    merchant_id: int
    offer_id: int
    transaction_amount: float
    transaction_date: str
    order_id: str
    screenshot_url: str | None = None
    notes: str | None = None


class WithdrawalRequest(BaseModel):
    amount: float
    method: str
    destination_details: dict


TRANSACTION_SAMPLE = {
    "id": 456,
    "uuid": "txn-uuid",
    "amount": 50.00,
    "type": "cashback_earned",
    "description": "Cashback from Amazon purchase",
    "balance_after": 1250.50,
    "created_at": "2025-11-23T15:30:00Z",
}


@router.get("/", response_model=dict)
def wallet_summary():
    return {
        "success": True,
        "data": {
            "balance": 1250.50,
            "pending_cashback": 340.00,
            "lifetime_earnings": 5600.75,
            "total_withdrawn": 4010.25,
        },
    }


@router.get("/transactions", response_model=dict)
def list_wallet_transactions(filters: TransactionFilters = TransactionFilters()):
    return {
        "success": True,
        "data": {
            "transactions": [
                TRANSACTION_SAMPLE,
                {
                    "id": 455,
                    "amount": -100.00,
                    "type": "order_payment",
                    "description": "Payment for Order ORD-2025-001234",
                    "balance_after": 1200.50,
                    "created_at": "2025-11-24T10:00:00Z",
                },
            ],
            "pagination": {
                "current_page": filters.page,
                "total_pages": 5,
                "total_items": 90,
                "per_page": filters.limit,
            },
        },
    }


@router.get("/cashback-events", response_model=dict)
def list_cashback_events(status: str | None = None):
    return {
        "success": True,
        "data": {
            "cashback_events": [
                {
                    "id": 789,
                    "merchant": {"name": "Amazon India", "logo_url": "https://..."},
                    "offer": {"title": "60% Off Electronics"},
                    "transaction_amount": 5000.00,
                    "cashback_amount": 260.00,
                    "status": status or "pending",
                    "created_at": "2025-11-20T12:00:00Z",
                    "estimated_confirmation": "2025-12-20T12:00:00Z",
                },
                {
                    "id": 788,
                    "merchant": {"name": "Flipkart", "logo_url": "https://..."},
                    "cashback_amount": 50.00,
                    "status": "confirmed",
                    "confirmed_at": "2025-11-15T10:00:00Z",
                    "paid_at": "2025-11-15T10:01:00Z",
                },
            ],
            "summary": {"total_pending": 600.00, "total_confirmed": 4850.75, "total_rejected": 150.00},
            "pagination": {"current_page": 1, "total_pages": 3, "total_items": 50, "per_page": 20},
        },
    }


@router.post("/claim-missing-cashback", response_model=dict)
def claim_missing_cashback(payload: MissingCashbackRequest):
    return {"success": True, "message": "Claim submitted", "data": payload.model_dump()}


@router.post("/withdraw", status_code=201, response_model=dict)
def request_withdraw(payload: WithdrawalRequest):
    return {
        "success": True,
        "data": {
            "withdrawal_id": 45,
            "uuid": "withdrawal-uuid",
            "amount": payload.amount,
            "method": payload.method,
            "status": "pending",
            "estimated_processing_time": "24-48 hours",
            "created_at": datetime.utcnow().isoformat() + "Z",
        },
    }


@router.get("/withdrawals", response_model=dict)
def list_withdrawals():
    return {"success": True, "data": {"withdrawals": []}}
