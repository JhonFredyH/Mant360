from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from app.routers.auth import router as auth_router


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