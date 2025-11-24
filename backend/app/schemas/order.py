from pydantic import BaseModel
from datetime import datetime

class OrderRead(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True