from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from app.routers.auth import router as auth_router
from app.core.security import get_current_user
from app.models.user import User


create_tables()

app = FastAPI(
    title="CMMS API",
    description="Industrial Maintenance Management System",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}

@app.get("/me", tags=["Auth"])
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "role": current_user.role.value,
        "company_id": str(current_user.company_id)
    }