from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.defects import router as defects_router
from app.routes.patterns import router as patterns_router
from app.routes.ncrs import router as ncrs_router
from app.routes.tickets import router as tickets_router
from app.routes.alerts import router as alerts_router
from app.routes.stations import router as stations_router
from app.routes.products import router as products_router
from app.routes.defect_codes import router as defect_codes_router
from app.routes.settings import router as settings_router
from app.routes.analytics import router as analytics_router
from app.routes.demo import router as demo_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "defects_router",
    "patterns_router",
    "ncrs_router",
    "tickets_router",
    "alerts_router",
    "stations_router",
    "products_router",
    "defect_codes_router",
    "settings_router",
    "analytics_router",
    "demo_router",
]
