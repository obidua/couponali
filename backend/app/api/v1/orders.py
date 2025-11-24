from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderFilters(BaseModel):
    page: int = 1
    limit: int = 20
    status: str | None = None


ORDER_SUMMARY = {
    "id": 123,
    "order_number": "ORD-2025-001234",
    "uuid": "order-uuid",
    "total_amount": 630.00,
    "status": "fulfilled",
    "payment_status": "completed",
    "fulfillment_status": "delivered",
    "items_count": 3,
    "created_at": "2025-11-24T10:00:00Z",
    "completed_at": "2025-11-24T10:05:00Z",
}


@router.get("/", response_model=dict)
def list_orders(filters: OrderFilters = OrderFilters()):
    return {
        "success": True,
        "data": {
            "orders": [ORDER_SUMMARY],
            "pagination": {
                "current_page": filters.page,
                "total_pages": 3,
                "total_items": 45,
                "per_page": filters.limit,
            },
        },
    }


@router.get("/{order_number}", response_model=dict)
def get_order(order_number: str):
    return {
        "success": True,
        "data": {
            "id": 123,
            "order_number": order_number,
            "status": "fulfilled",
            "items": [
                {
                    "id": 1,
                    "product_name": "Flipkart E-Gift Voucher",
                    "product_sku": "EGVGBFLSCLPS001",
                    "denomination": 100.00,
                    "quantity": 2,
                    "unit_price": 100.00,
                    "total_price": 200.00,
                    "voucher_codes": [
                        {"code": "ABC123XYZ456", "pin": "7890", "expiry": "2026-11-24", "status": "active"},
                        {"code": "DEF789GHI012", "pin": "3456", "expiry": "2026-11-24", "status": "active"},
                    ],
                    "fulfillment_status": "delivered",
                    "delivered_at": "2025-11-24T10:05:00Z",
                }
            ],
            "subtotal": 700.00,
            "discount_amount": 70.00,
            "wallet_used": 100.00,
            "total_amount": 530.00,
            "payment": {"method": "razorpay", "status": "success", "paid_at": "2025-11-24T10:02:00Z"},
            "created_at": "2025-11-24T10:00:00Z",
            "completed_at": "2025-11-24T10:05:00Z",
        },
    }
