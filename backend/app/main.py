from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routes import (
    auth_router,
    dashboard_router,
    defects_router,
    patterns_router,
    ncrs_router,
    tickets_router,
    alerts_router,
    stations_router,
    products_router,
    defect_codes_router,
    settings_router,
    analytics_router,
    demo_router,
)
from app.websocket import manager
from app.seed import run_seed

app = FastAPI(
    title="Forge Sentinel API",
    description="Real-Time Manufacturing Defect Detection & Auto-Escalation Engine",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(defects_router)
app.include_router(patterns_router)
app.include_router(ncrs_router)
app.include_router(tickets_router)
app.include_router(alerts_router)
app.include_router(stations_router)
app.include_router(products_router)
app.include_router(defect_codes_router)
app.include_router(settings_router)
app.include_router(analytics_router)
app.include_router(demo_router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Check if database has data, seed if empty
    db = SessionLocal()
    try:
        from app.models.models import Station
        station_cnt = db.query(Station).count()
        if station_cnt == 0:
            print("Database empty. Auto-seeding initial data...")
            run_seed(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Forge Sentinel Manufacturing Quality Intelligence Engine",
        "version": "1.0.0"
    }

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep-alive receive loop
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
