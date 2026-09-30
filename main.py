from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth, products, standards, match, verification, analytics, assistant

settings = get_settings()

app = FastAPI(title="SmartMetra AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    if settings.DEMO_MODE:
        from app.seed import run as seed_demo_data

        seed_demo_data()
    else:
        init_db()


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.ENV, "demo_mode": settings.DEMO_MODE}


app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["auth"])
app.include_router(products.router, prefix=f"{settings.API_PREFIX}/products", tags=["products"])
app.include_router(standards.router, prefix=f"{settings.API_PREFIX}/standards", tags=["standards"])
app.include_router(match.router, prefix=f"{settings.API_PREFIX}/match", tags=["match"])
app.include_router(verification.router, prefix=f"{settings.API_PREFIX}/verification", tags=["verification"])
app.include_router(analytics.router, prefix=f"{settings.API_PREFIX}/analytics", tags=["analytics"])
app.include_router(assistant.router, prefix=f"{settings.API_PREFIX}/assistant", tags=["assistant"])
