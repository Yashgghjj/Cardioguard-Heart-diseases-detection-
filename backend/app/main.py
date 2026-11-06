from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.seed import seed_database
import app.models # ensure all models are registered

# Import API routes
from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.model import router as model_router
from app.api.v1.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default data
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CardioGuard AI - Advanced Heart Disease Detection & Risk Assessment Platform REST API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix="/api", tags=["System Health"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication & Security"])
app.include_router(patients_router, prefix="/api/patients", tags=["Patient Management"])
app.include_router(predictions_router, prefix="/api/predictions", tags=["Risk Predictions & Assessments"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Clinical Analytics"])
app.include_router(model_router, prefix="/api/model", tags=["Machine Learning Engine"])

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

