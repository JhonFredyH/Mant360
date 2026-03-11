from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from app.core.database import get_db
from app.core.config import settings
from app.models.company import Company
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    if db.query(Company).filter(Company.slug == payload.company_slug).first():
        raise HTTPException(status_code=400, detail="Slug de empresa ya en uso")

    company = Company(name=payload.company_name, slug=payload.company_slug)
    db.add(company)
    db.flush()

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
        company_id=company.id,
    )
    db.add(user)
    db.commit()

    token = create_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    token = create_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token)