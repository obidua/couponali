from fastapi import APIRouter

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=dict)
def global_search(q: str, type: str = "all", limit: int = 10):
    return {
        "success": True,
        "data": {
            "merchants": [] if type not in {"all", "merchant"} else [{"name": "Amazon India"}],
            "offers": [] if type not in {"all", "offer"} else [{"title": "60% Off on Fashion"}],
            "products": [] if type not in {"all", "product"} else [{"name": "Flipkart E-Gift Voucher"}],
            "total_results": 45,
        },
    }
