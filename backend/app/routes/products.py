from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Product

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [{
        "id": p.id,
        "product_code": p.product_code,
        "product_name": p.product_name,
        "version": p.version,
        "category": p.category,
        "status": p.status
    } for p in products]
