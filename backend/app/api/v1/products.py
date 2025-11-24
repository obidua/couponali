from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["Products"])

class ProductFilters(BaseModel):
    page: int = 1
    limit: int = 20
    category_id: int | None = None
    merchant_id: int | None = None
    is_featured: bool | None = None
    is_bestseller: bool | None = None
    min_price: float | None = None
    max_price: float | None = None
    search: str | None = None
    sort: str | None = None


PRODUCT_SAMPLE = {
    "id": 1,
    "uuid": "product-uuid",
    "name": "Flipkart E-Gift Voucher",
    "slug": "flipkart-egift-voucher",
    "sku": "EGVGBFLSCLPS001",
    "description": "...",
    "image_url": "https://...",
    "category": {"id": 1, "name": "E-Commerce/Online"},
    "merchant": {"id": 2, "name": "Flipkart", "logo_url": "https://..."},
    "variants": [
        {"id": 1, "denomination": 100.00, "selling_price": 100.00, "is_available": True},
        {"id": 2, "denomination": 500.00, "selling_price": 500.00, "is_available": True},
    ],
    "card_type": "e-gift",
    "delivery_method": "email",
    "validity_days": 365,
    "is_in_stock": True,
    "is_featured": False,
    "sales_count": 456,
}


@router.get("/", response_model=dict)
def list_products(filters: ProductFilters = ProductFilters()):
    return {
        "success": True,
        "data": {
            "products": [PRODUCT_SAMPLE],
            "pagination": {
                "current_page": filters.page,
                "total_pages": 5,
                "total_items": 80,
                "per_page": filters.limit,
            },
        },
    }


@router.get("/{slug}", response_model=dict)
def get_product(slug: str):
    data = PRODUCT_SAMPLE.copy()
    data["slug"] = slug
    return {"success": True, "data": data}
