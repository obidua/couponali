from fastapi import FastAPI
from .config import get_settings
from .api.v1 import (
    users,
    merchants,
    offers,
    products,
    orders,
    wallet,
    auth,
    admin,
    access,
    gift_cards,
    referrals,
    cashback,
    withdrawals,
    payouts,
    support_tickets,
    notifications,
    audit_logs,
    payments,
    cms_pages,
    sessions,
    kyc,
    inventory,
    commissions,
    redirects,
    offer_views,
    categories,
    search,
    cms,
    checkout,
    cart,
    health,
    affiliate,
)
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

# Rate limiting middleware using Redis
from .redis_client import rate_limit
from fastapi import Request, HTTPException

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/health" or request.url.path.startswith("/docs"):
        return await call_next(request)
    client_ip = request.client.host or "unknown"
    allowed, remaining, ttl = rate_limit(client_ip, limit=100, window_seconds=60)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests. Slow down.")
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "100"
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(ttl)
    return response

# Include all routers with /api/v1 prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(merchants.router, prefix="/api/v1")
app.include_router(offers.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(access.router, prefix="/api/v1")
app.include_router(gift_cards.router, prefix="/api/v1")
app.include_router(referrals.router, prefix="/api/v1")
app.include_router(cashback.router, prefix="/api/v1")
app.include_router(withdrawals.router, prefix="/api/v1")
app.include_router(payouts.router, prefix="/api/v1")
app.include_router(support_tickets.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(audit_logs.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(cms_pages.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(kyc.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")
app.include_router(commissions.router, prefix="/api/v1")
app.include_router(redirects.router, prefix="/api/v1")
app.include_router(offer_views.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(cms.router, prefix="/api/v1")
app.include_router(checkout.router, prefix="/api/v1")
app.include_router(cart.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
app.include_router(affiliate.router, prefix="/api/v1")


GROUP_ORDER = [
    ("Auth", ["Auth"]),
    ("Users", ["Users"]),
    ("Merchants", ["Merchants"]),
    ("Offers", ["Offers"]),
    ("Offers", ["Categories"]),
    ("Products", ["Products"]),
    ("Orders", ["Checkout"]),
    ("Orders", ["Orders"]),
    ("Wallet", ["Wallet"]),
    ("Gifts", ["Gifts"]),
    ("Engagement", ["Engagement"]),
    ("Cashback", ["Cashback"]),
    ("Affiliate", ["Affiliate"]),
    ("Finance", ["Finance"]),
    ("Engagement", ["Search"]),
    ("CMS", ["CMS"]),
    ("Support", ["Support"]),
    ("Admin", ["Admin"]),
    ("Access", ["Access Control"]),
    ("System", ["System"]),
    ("KYC", ["KYC"]),
    ("Sessions", ["Sessions"]),
    ("Inventory", ["Inventory"]),
    ("Commissions", ["Commissions"]),
    ("Redirects", ["Redirects"]),
    ("Offer Views", ["OfferViews"]),
    ("CMS", ["CMS"]),
]

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=settings.APP_NAME,
        version="0.1.0",
        description="Hybrid coupon + commerce API",
        routes=app.routes,
    )
    grouped_tags = []
    for group_name, tag_list in GROUP_ORDER:
        for tag in tag_list:
            grouped_tags.append({"name": tag, "x-group": group_name})
    openapi_schema["tags"] = grouped_tags
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

app.mount("/static", StaticFiles(directory="app/static"), name="static")
# Serve images directory for merchant logos, offer images, etc.
app.mount("/images", StaticFiles(directory="app/images"), name="images")

@app.get("/docs", include_in_schema=False)
def custom_docs():
    html = get_swagger_ui_html(openapi_url=app.openapi_url, title=f"{settings.APP_NAME} Docs", swagger_css_url="/static/swagger.css")
    # Inject dark mode toggle
    injected = html.body.decode().replace("</body>", "<button class='dark-mode-toggle' onclick=\"document.documentElement.classList.toggle('dark');\">Toggle Dark</button></body>")
    return HTMLResponse(injected)

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok"}
