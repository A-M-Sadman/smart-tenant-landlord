from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers import auth
from app.routers import property as property_router
from app.routers import tenant as tenant_router
from app.routers import images as images_router
from app.routers import assignment
from app.routers import maintenance
from app.routers import agreement
from app.routers import payment
from app.routers import complaint
from app.routers import dashboard
from app.routers import analytics


# Create tables (dev only — use Alembic in prod)
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Tenant-Landlord Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(property_router.router, prefix="/api/v1")
app.include_router(tenant_router.router, prefix="/api/v1")
app.include_router(images_router.router, prefix="/api/v1")
app.include_router(assignment.router)
app.include_router(maintenance.router)
app.include_router(agreement.router)
app.include_router(payment.router)
app.include_router(complaint.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Smart Tenant-Landlord API is running."}


# To activate the virtual environment, 
# Run the following command in your terminal: .\venv\Scripts\activate
# Then run backend: uvicorn main:app --reload
# Uvicorn running on: http://127.0.0.1:8000