from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext
from fastapi import Response 
from app.core.database import get_db
from app.core.config import settings
from app.models.company import Company
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import get_current_user

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


@router.post("/login", status_code=status.HTTP_200_OK)
def login(
    response: Response,  # ✅ Nuevo parámetro para configurar cookies
    payload: LoginRequest, 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Usuario inactivo"
        )

    # 1. Generar token JWT (igual que antes)
    access_token = create_token({
        "sub": str(user.id), 
        "role": user.role.value,
        "company_id": str(user.company_id) if user.company_id else None
    })
    
    # 2. 🍪 Configurar cookie HttpOnly (CRÍTICO PARA SEGURIDAD)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,           # ❌ JavaScript NO puede leerla (previene XSS)
        secure=False,            # ✅ Cambiar a True en producción (HTTPS)
        samesite="lax",          # ✅ Previene CSRF básico
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",                # ✅ Disponible en toda la app
    )
    
    # 3. Respuesta SIN token en el body (la cookie ya está enviada)
    return {
        "message": "Login exitoso",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "company_id": str(user.company_id) if user.company_id else None
        }
    }
    
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Obtiene los datos del usuario autenticado.
    Usado por el frontend para verificar si la sesión es válida.
    La cookie 'access_token' se valida automáticamente mediante get_current_user.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role.value,
        "status": current_user.status.value,
        "company_id": str(current_user.company_id) if current_user.company_id else None,
    }    
    
    