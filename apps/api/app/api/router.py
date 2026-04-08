from fastapi import APIRouter

from app.api.routes import admin, auth, learner, reporting, websocket

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(learner.router)
api_router.include_router(reporting.router)
api_router.include_router(websocket.router)

