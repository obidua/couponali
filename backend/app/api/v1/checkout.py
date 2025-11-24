from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(tags=["Checkout"])


class CartItem(BaseModel):
    variant_id: int
    quantity: int


class CartValidateRequest(BaseModel):
    items: list[CartItem]
    promo_code: str | None = None


class CreateOrderRequest(BaseModel):
    items: list[CartItem]
    promo_code: str | None = None
    use_wallet_balance: bool | None = None
    wallet_amount: float | None = None
    delivery_email: str
    delivery_mobile: str


class VerifyPaymentRequest(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/cart/validate", response_model=dict)
def validate_cart(payload: CartValidateRequest):
    return {
        "success": True,
        "data": {
            "items": [
                {
                    "variant_id": item.variant_id,
                    "product_name": "Flipkart E-Gift Voucher",
                    "denomination": 100.00,
                    "quantity": item.quantity,
                    "unit_price": 100.00,
                    "total_price": 100.00 * item.quantity,
                    "is_available": True,
                }
                for item in payload.items
            ],
            "subtotal": 700.00,
            "discount": 70.00 if payload.promo_code else 0.0,
            "tax": 0.00,
            "total": 630.00 if payload.promo_code else 700.00,
            "promo_applied": {
                "code": payload.promo_code or "NONE",
                "discount_type": "percentage",
                "discount_value": 10,
            }
            if payload.promo_code
            else None,
        },
    }


@router.post("/checkout/create-order", status_code=status.HTTP_201_CREATED, response_model=dict)
def create_order(payload: CreateOrderRequest):
    return {
        "success": True,
        "data": {
            "order_id": 123,
            "order_number": "ORD-2025-001234",
            "uuid": "order-uuid",
            "total_amount": 530.00,
            "payment_required": True,
            "payment_details": {
                "gateway": "razorpay",
                "order_id": "order_Nkd...",
                "amount": 53000,
                "currency": "INR",
                "key": "rzp_live_mock",
            },
        },
    }


@router.post("/checkout/payment-webhook", status_code=status.HTTP_204_NO_CONTENT)
def payment_webhook():
    # In production, verify Razorpay signature and update order status
    return


@router.post("/checkout/verify-payment", response_model=dict)
def verify_payment(payload: VerifyPaymentRequest):
    return {
        "success": True,
        "data": {
            "payment_verified": True,
            "order_status": "paid",
            "message": "Payment successful! Order processing started.",
        },
    }
