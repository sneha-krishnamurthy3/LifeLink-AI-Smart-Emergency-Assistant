"""
LifeLink AI - FastAPI Application Entry Point

Configures CORS, registers all routers, and exposes health-check endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, donors, hospitals
from app.config import FRONTEND_URL

app = FastAPI(
    title="LifeLink AI API",
    description="AI-Powered Emergency Response Platform — providing instant first-aid guidance, blood donor search, and nearby hospital lookup.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──
app.include_router(chat.router)
app.include_router(donors.router)
app.include_router(hospitals.router)


# ── Root & Health ──

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — confirms the API is running."""
    return {
        "message": "LifeLink AI API is running",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Lightweight health check for monitoring and load-balancers."""
    return {
        "status": "healthy",
        "service": "LifeLink AI Backend",
    }
