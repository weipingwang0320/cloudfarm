from datetime import datetime
from fastapi import APIRouter
from app.modules.adoption import (
    get_adoption_plans,
    generate_certificate,
    generate_growth_album,
    generate_harvest_message,
    get_sharing_card,
)

router = APIRouter(prefix="/api/adoption", tags=["adoption"])


@router.get("/plans")
async def get_plans():
    return {"success": True, "data": get_adoption_plans()}


@router.post("/certificate")
async def create_certificate(data: dict):
    cert = generate_certificate(
        owner_name=data.get("owner_name", "游客"),
        crop_type=data.get("crop_type", "tomato"),
        variety=data.get("variety", "普通品种"),
        grow_days=data.get("grow_days", 0),
        harvest_date=data.get("harvest_date", datetime.now().strftime("%Y-%m-%d")),
    )
    return {"success": True, "data": cert}


@router.post("/album")
async def create_album(data: dict):
    album = generate_growth_album(data.get("daily_log", []))
    return {"success": True, "data": album}


@router.post("/harvest-message")
async def get_harvest_message(data: dict):
    msg = generate_harvest_message(
        owner_name=data.get("owner_name", "游客"),
        crop_type=data.get("crop_type", "tomato"),
        grow_days=data.get("grow_days", 0),
    )
    return {"success": True, "data": {"message": msg}}


@router.post("/share-card")
async def get_share_card(data: dict):
    cert = data.get("certificate", {})
    album = data.get("album", [])
    card = get_sharing_card(cert, album)
    return {"success": True, "data": card}