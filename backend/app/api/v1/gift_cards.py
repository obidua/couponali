from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...database import get_db
from ...models import GiftCard
from ...schemas import GiftCardRead, GiftCardCreate
from ...dependencies import require_admin

router = APIRouter(prefix="/gift-cards", tags=["Gifts"])

@router.get("/", response_model=list[GiftCardRead])
def list_gift_cards(db: Session = Depends(get_db), _: object = Depends(require_admin)):
    return db.query(GiftCard).all()

@router.post("/", response_model=GiftCardRead)
def create_gift_card(payload: GiftCardCreate, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    existing = db.query(GiftCard).filter(GiftCard.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Code already exists")
    gc = GiftCard(**payload.dict())
    db.add(gc)
    db.commit()
    db.refresh(gc)
    return gc
