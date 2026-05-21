import json
import os
from datetime import date, timedelta
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _load_json(filename: str):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class CalendarEngine:
    def __init__(self):
        self._crops_data = _load_json("crop_growth_cycles.json")
        self._provinces_data = _load_json("province_climate_zones.json")
        self._solar_terms_data = _load_json("solar_terms.json")
        self._frost_data = _load_json("frost_free_periods.json")

    def get_crops_list(self) -> list[dict]:
        return [
            {
                "key": c["key"],
                "name": c["name"],
                "category": c["category"],
                "icon": c["icon"],
                "total_days": sum(s["days"] for s in c["stages"]),
                "description": c["description"],
            }
            for c in self._crops_data["crops"]
        ]

    def get_provinces_list(self) -> list[dict]:
        return self._provinces_data["provinces"]

    def generate_timeline(
        self, crop_key: str, province_name: str, zone_key: str, sowing_date_str: str
    ) -> dict:
        crop = self._find_crop(crop_key)
        if not crop:
            raise ValueError(f"作物 '{crop_key}' 不存在")

        province = self._find_province(province_name)
        if not province:
            raise ValueError(f"省份 '{province_name}' 不存在")

        zone = self._find_zone(province, zone_key)
        if not zone:
            raise ValueError(f"气候区 '{zone_key}' 在省份 '{province_name}' 中不存在")

        sowing_date = date.fromisoformat(sowing_date_str)
        factor = zone["adjustment_factor"]
        frost = self._frost_data["zones"].get(zone_key)

        timeline = []
        current_date = sowing_date
        year = sowing_date.year

        for stage in crop["stages"]:
            adjusted_days = max(1, round(stage["days"] * factor))
            stage_start = current_date
            stage_end = current_date + timedelta(days=adjusted_days - 1)

            if frost:
                frost_start = self._parse_mmdd(frost["frost_free_start"], year)
                frost_end = self._parse_mmdd(frost["frost_free_end"], year)

                if stage_start < frost_start:
                    stage_start = frost_start
                    stage_end = stage_start + timedelta(days=adjusted_days - 1)
                    year = stage_start.year

            notes = []
            risk_warning = None

            if frost and stage_end > frost_end and stage_end.month != frost_start.month:
                remaining = (stage_end - frost_end).days
                if remaining > 5:
                    risk_warning = f"该阶段可能受霜冻影响（超出无霜期{remaining}天）"

            solar_note = self._find_nearest_solar_term(stage_start)
            if solar_note:
                notes.append(f"临近节气：{solar_note}")

            timeline.append({
                "order": stage["order"],
                "name": stage["name"],
                "name_en": stage["name_en"],
                "start_date": stage_start.isoformat(),
                "end_date": stage_end.isoformat(),
                "duration_days": adjusted_days,
                "description": stage["description"],
                "color": stage["color"],
                "notes": notes,
                "risk_warning": risk_warning,
            })

            current_date = stage_end + timedelta(days=1)

        total_days = sum(s["duration_days"] for s in timeline)

        result = {
            "crop_name": crop["name"],
            "crop_icon": crop["icon"],
            "crop_category": crop["category"],
            "province": province_name,
            "zone_name": zone["name"],
            "zone_key": zone_key,
            "zone_adjustment": f"{factor:.2f}x",
            "zone_description": zone.get("description", ""),
            "sowing_date": sowing_date_str,
            "harvest_date": timeline[-1]["end_date"],
            "total_days": total_days,
            "frost_free": None,
            "timeline": timeline,
        }

        if frost:
            result["frost_free"] = {
                "start": frost["frost_free_start"],
                "end": frost["frost_free_end"],
                "days": frost["days"],
            }

        return result

    def _find_crop(self, key: str) -> Optional[dict]:
        for c in self._crops_data["crops"]:
            if c["key"] == key:
                return c
        return None

    def _find_province(self, name: str) -> Optional[dict]:
        for p in self._provinces_data["provinces"]:
            if p["name"] == name:
                return p
        return None

    def _find_zone(self, province: dict, zone_key: str) -> Optional[dict]:
        for z in province["zones"]:
            if z["key"] == zone_key:
                return z
        return None

    def _parse_mmdd(self, mmdd: str, year: int) -> date:
        month, day = mmdd.split("-")
        return date(year, int(month), int(day))

    def _find_nearest_solar_term(self, target_date: date) -> Optional[str]:
        best = None
        best_diff = 999
        for term in self._solar_terms_data["solar_terms"]:
            term_year = target_date.year
            try:
                term_date = date(term_year, term["month"], term["approx_day"])
            except ValueError:
                continue
            diff = abs((target_date - term_date).days)
            if diff < best_diff:
                best_diff = diff
                best = term
        if best and best_diff <= 3:
            return best["name"]
        return None


calendar_engine = CalendarEngine()
