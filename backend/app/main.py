from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from app.core.config import settings
from app.routers import auth, users, wedding, guests, vendors, tasks, budget, invitation, documents, moodboard, schedule, rundown, hantaran, menu, seating, gift, honeymoon

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="PlanLuhh API",
    description="Wedding Planning Platform — API",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url="/redoc" if settings.APP_ENV == "development" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(wedding.router, prefix="/api/v1")
app.include_router(guests.router, prefix="/api/v1")
app.include_router(vendors.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(budget.router, prefix="/api/v1")
app.include_router(invitation.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(moodboard.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")
app.include_router(rundown.router, prefix="/api/v1")
app.include_router(hantaran.router, prefix="/api/v1")
app.include_router(menu.router, prefix="/api/v1")
app.include_router(seating.router, prefix="/api/v1")
app.include_router(gift.router, prefix="/api/v1")
app.include_router(honeymoon.router, prefix="/api/v1")


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}
