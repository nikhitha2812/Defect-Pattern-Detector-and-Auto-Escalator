from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user:
        # Default fallback for demo user login if seed wasn't run yet
        role = "ENGINEER"
        if "admin" in req.email:
            role = "ADMIN"
        elif "manager" in req.email:
            role = "QUALITY_MANAGER"
        elif "leader" in req.email:
            role = "LINE_LEADER"

        user = User(
            email=req.email,
            password_hash="demo_hashed",
            full_name=req.email.split("@")[0].replace(".", " ").title(),
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_data = {
        "sub": user.email,
        "role": user.role,
        "name": user.full_name
    }

    return {
        "access_token": f"token-{user.id}-{user.role.lower()}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me")
def get_me():
    return {
        "id": 1,
        "email": "engineer@forgesentinel.com",
        "full_name": "Field Quality Engineer",
        "role": "ENGINEER"
    }
