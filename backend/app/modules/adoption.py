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
    health_score: float,
    quality_grade: str,
    quality_icon: str,
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
        "health_score": health_score,
        "quality_grade": f"{quality_icon} {quality_grade}",
        "harvest_date": harvest_date,
        "issue_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "message": f"恭喜 {owner_name}！您的{crop_name}已成功收获！在您精心照料下，作物获得了{quality_grade}的评价。感谢您选择云上田园，期待您的下一次认养！🌾",
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
                    "health": entry.get("health_score", 0),
                    "height": entry.get("height", 0),
                    "weather": entry.get("weather_desc", ""),
                }
            )

    return milestones


def generate_harvest_message(
    owner_name: str,
    crop_type: str,
    health_score: float,
    grow_days: int,
    quality_grade: str,
    quality_icon: str,
) -> str:
    crop_names = {"tomato": "番茄", "wheat": "小麦", "strawberry": "草莓", "rice": "水稻", "corn": "玉米"}
    crop_name = crop_names.get(crop_type, crop_type)

    base_msg = f"亲爱的 {owner_name}，您的{crop_name}历经{grow_days}天终于成熟啦！"

    if health_score >= 80:
        msg = f"{base_msg}🎉 太棒了！您的精心照料获得了{quality_icon}大丰收！果实饱满，品质上乘，这是属于您的荣耀时刻！"
    elif health_score >= 50:
        msg = f"{base_msg}✅ 作物顺利收获！虽然不是最完美的状态，但您的付出没有白费。下次多关注浇水施肥，一定能更好！"
    else:
        msg = f"{base_msg}💧 虽然产量不太理想，但每一次种植都是宝贵的经验。别灰心，下次一定会更好！云上田园始终与您同行。"

    return msg


def get_sharing_card(certificate: dict, album: list) -> dict:
    return {
        "title": f"🌾 我在云上田园收获了{certificate['crop_name']}！",
        "content": certificate["message"],
        "milestones": album,
        "qr_data": "https://cloudfarm.example.com/share",
    }