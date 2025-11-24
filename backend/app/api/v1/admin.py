from fastapi import APIRouter, Header, HTTPException, Depends
from ...redis_client import cache_invalidate, rk
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return True


class MerchantPayload(BaseModel):
    name: str
    slug: str
    description: str | None = None


class OfferPayload(BaseModel):
    merchant_id: int
    title: str
    code: str | None = None
    priority: int = 0


class ProductPayload(BaseModel):
    merchant_id: int
    name: str
    slug: str
    price: float
    stock: int = 0


class ProductVariantPayload(BaseModel):
    denomination: float
    selling_price: float
    is_available: bool = True


class OrderStatusUpdate(BaseModel):
    status: str


@router.post("/merchants", response_model=dict)
def create_merchant(payload: MerchantPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": 1, **payload.model_dump()}}


@router.put("/merchants/{id}", response_model=dict)
def update_merchant(id: int, payload: MerchantPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, **payload.model_dump()}}


@router.delete("/merchants/{id}", response_model=dict)
def delete_merchant(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "message": "Merchant soft deleted"}


@router.post("/offers", response_model=dict)
def create_offer(payload: OfferPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": 10, **payload.model_dump()}}


@router.put("/offers/{id}", response_model=dict)
def update_offer(id: int, payload: OfferPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, **payload.model_dump()}}


@router.delete("/offers/{id}", response_model=dict)
def delete_offer(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "message": "Offer deleted"}


@router.post("/products", response_model=dict)
def create_product(payload: ProductPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": 20, **payload.model_dump()}}


@router.put("/products/{id}", response_model=dict)
def update_product(id: int, payload: ProductPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, **payload.model_dump()}}


@router.post("/products/{id}/variants", response_model=dict)
def add_variant(id: int, payload: ProductVariantPayload, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"product_id": id, "variant_id": 99, **payload.model_dump()}}

@router.post("/merchants/{slug}/invalidate", response_model=dict)
def invalidate_merchant_cache(slug: str):
    cache_invalidate(rk("cache", "merchant", slug))
    return {"success": True, "message": f"Cache invalidated for merchant {slug}"}
@router.get("/orders", response_model=dict)
def list_orders(_: bool = Depends(require_admin)):
    return {"success": True, "data": {"orders": [], "pagination": {"current_page": 1, "total_pages": 1, "total_items": 0, "per_page": 20}}}


@router.patch("/orders/{id}/status", response_model=dict)
def update_order_status(id: int, payload: OrderStatusUpdate, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"order_id": id, "status": payload.status}}


@router.post("/orders/{id}/fulfill", response_model=dict)
def fulfill_order(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "message": "Order fulfilled and vouchers sent"}


@router.get("/cashback", response_model=dict)
def list_cashback(_: bool = Depends(require_admin)):
    return {"success": True, "data": {"cashback_events": []}}


@router.patch("/cashback/{id}/confirm", response_model=dict)
def confirm_cashback(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, "status": "confirmed"}}


@router.patch("/cashback/{id}/reject", response_model=dict)
def reject_cashback(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, "status": "rejected"}}


@router.get("/withdrawals", response_model=dict)
def list_withdrawals(_: bool = Depends(require_admin)):
    return {"success": True, "data": {"withdrawals": []}}


@router.patch("/withdrawals/{id}/approve", response_model=dict)
def approve_withdrawal(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, "status": "approved"}}


@router.patch("/withdrawals/{id}/complete", response_model=dict)
def complete_withdrawal(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, "status": "completed"}}


@router.patch("/withdrawals/{id}/reject", response_model=dict)
def reject_withdrawal(id: int, _: bool = Depends(require_admin)):
    return {"success": True, "data": {"id": id, "status": "rejected"}}


@router.get("/analytics/dashboard", response_model=dict)
def analytics_dashboard(_: bool = Depends(require_admin)):
    return {"success": True, "data": {"orders": 100, "revenue": 150000.0, "users": 5000}}


@router.get("/analytics/revenue", response_model=dict)
def analytics_revenue(_: bool = Depends(require_admin)):
    return {"success": True, "data": {"series": []}}


@router.get("/analytics/top-merchants", response_model=dict)
def analytics_top_merchants(_: bool = Depends(require_admin)):
    return {"success": True, "data": {"merchants": []}}
