from fastapi import APIRouter

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=dict)
def list_categories(type: str | None = None, is_featured: bool | None = None):
    return {
        "success": True,
        "data": {
            "categories": [
                {
                    "id": 1,
                    "name": "Fashion",
                    "slug": "fashion",
                    "icon_url": "https://...",
                    "type": type or "both",
                    "offers_count": 234,
                    "products_count": 12,
                    "is_featured": is_featured if is_featured is not None else True,
                }
            ]
        },
    }
