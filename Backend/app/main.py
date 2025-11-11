import os
from fastapi.responses import RedirectResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.users import router as users_router
from app.migrate import apply_all_sql_in_sql_dir

openapi_tags = [
    {
        "name": "Users",
        "description": "Manage application users (admin functions, profile management, soft/hard deletion).",
    }
]

app = FastAPI(
    title="NutriWise Core API (MySQL)",
    version="1.0.0",
    description=(
        "MySQL-backed API with User CRUD.\n\n"
        "Includes soft delete, pagination, search, and OpenAPI examples."
    ),
    contact={"name": "NutriWise", "email": "support@nutriwise.app"},
    license_info={"name": "MIT"},
    openapi_tags=openapi_tags,
    docs_url="/",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True
)

@app.on_event("startup")
async def maybe_apply_sql():
    if os.getenv("APPLY_SQL_ON_STARTUP", "false").lower() in {"1","true","yes"}:
        apply_all_sql_in_sql_dir()  # dev convenience

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok"}
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
app.include_router(users_router)
