from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

# Import modular routers
from routers import (
    auth_router,
    cases_router,
    documents_router,
    intelligence_router,
    assistant_router,
    dataset_router,
    legal_research_router,
    drafts_router
)

# Ensure all database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LawLens API",
    description="AI-Powered Legal Intelligence and Decision-Support Platform for Lawyers",
    version="1.1.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(cases_router.router, prefix="/api")
app.include_router(documents_router.router, prefix="/api")
app.include_router(intelligence_router.router, prefix="/api")
app.include_router(assistant_router.router, prefix="/api")
app.include_router(dataset_router.router, prefix="/api")
app.include_router(legal_research_router.router, prefix="/api")
app.include_router(drafts_router.router, prefix="/api")


# Top-level backwards compatibility aliases for Phase 3 & 6 tests
app.include_router(auth_router.router)


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Health check endpoints for Render and uptime monitoring
@app.get("/healthz")
@app.get("/api/health")
def healthz():
    return {"status": "ok", "platform": "LawLens Legal Intelligence"}


# Production SPA frontend static files serving (e.g. Render unified deployment)
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

@app.get("/")
def read_root():
    if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
    return {
        "project": "LawLens Legal Intelligence Platform",
        "status": "operational",
        "docs_url": "/docs"
    }

if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["docs", "openapi.json", "redoc"]:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        target = os.path.join(frontend_dist, full_path)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)