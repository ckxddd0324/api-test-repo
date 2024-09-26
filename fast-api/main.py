import coverage
from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from services.users import user_router
from services.items import item_router

# Start coverage monitoring
cov = coverage.Coverage()
cov.start()

# Main FastAPI instance
app = FastAPI(title="Main API")

# Include the routers for each service
app.include_router(user_router, prefix="/users")
app.include_router(item_router, prefix="/items")

# Custom OpenAPI endpoint for the main app


@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_json():
    return JSONResponse(app.openapi())

# Custom Swagger UI for the main app


@app.get("/docs", include_in_schema=False)
async def get_swagger_ui():
    urls = [
        {"url": "/users/openapi.json", "name": "User Service"},
        {"url": "/items/openapi.json", "name": "Item Service"}
    ]
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_ui_parameters={
            "urls": urls,
            "deepLinking": True,
        },
    )

# Serve OpenAPI schemas for each service


@app.get("/users/openapi.json", include_in_schema=False)
async def get_user_openapi():
    return JSONResponse(user_router.openapi())


@app.get("/items/openapi.json", include_in_schema=False)
async def get_item_openapi():
    return JSONResponse(item_router.openapi())
