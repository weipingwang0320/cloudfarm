from datetime import datetime, timedelta
from typing import Optional

from app.config import settings


ADOPTION_PLANS = {
    "体验认养": {
        "price": 19.9,
        "price_label": "19.9元",
        "description": "纯虚拟体验，收获电子证书与成长相册",
        "duration_days": 30,
        "has_physical_delivery": False,
        "color": "#52c41a",
    },
    "标准认养": {
        "price": 99.0,
        "price_label": "99元",
        "description": "含实物配送，收获季寄送新鲜农产品到家",
        "duration_days": 90,
        "has_physical_delivery": True,
        "color": "#1890ff",
    },
    "农场主": {
        "price": 299.0,
        "price_label": "299元",
        "description": "整块地专属认养，定制种植品种，专属铭牌",
        "duration_days": 180,
        "has_physical_delivery": True,
        "color": "#722ed1",
    },
}


def get_adoption_plans() -> dict:
    return ADOPTION_PLANS


def generate_certificate(
    owner_name: str,
    crop_type: str,
    variety: str,
    grow_days: int,
    harvest_date: str,
) -> dict:
    crop_names = {"tomato": "番茄", "wheat": "小麦", "strawberry": "草莓", "rice": "水稻", "corn": "玉米"}
    crop_name = crop_names.get(crop_type, crop_type)

    return {
        "certificate_id": f"CERT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "owner_name": owner_name,
        "crop_name": crop_name,
        "variety": variety,
        "grow_days": grow_days,
        "harvest_date": harvest_date,
        "issue_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "message": f"恭喜 {owner_name}！您的{crop_name}已成功收获！在您精心照料下，作物茁壮成长。感谢您选择云上田园，期待您的下一次认养！🌾",
    }


def generate_growth_album(daily_log: list) -> list:
    if not daily_log:
        return []

    milestones = []
    seen_stages = set()

    for entry in daily_log:
        stage = entry.get("stage", 0)
        if stage not in seen_stages:
            seen_stages.add(stage)
            milestones.append(
                {
                    "day": entry.get("day_number", 0),
                    "date": entry.get("date", ""),
                    "stage": entry.get("stage_name", ""),
                    "height": entry.get("height", 0),
                    "weather": entry.get("weather_desc", ""),
                }
            )

    return milestones


def generate_harvest_message(
    owner_name: str,
    crop_type: str,
    grow_days: int,
) -> str:
    crop_names = {"tomato": "番茄", "wheat": "小麦", "strawberry": "草莓", "rice": "水稻", "corn": "玉米"}
    crop_name = crop_names.get(crop_type, crop_type)

    msg = f"亲爱的 {owner_name}，您的{crop_name}历经{grow_days}天终于成熟啦！🎉 在您的精心照料下，作物茁壮成长，终于迎来了收获的时刻！感谢您选择云上田园，期待您的下一次认养！🌾"

    return msg


def get_sharing_card(certificate: dict, album: list) -> dict:
    return {
        "title": f"🌾 我在云上田园收获了{certificate['crop_name']}！",
        "content": certificate["message"],
        "milestones": album,
        "qr_data": "https://cloudfarm.example.com/share",
    }