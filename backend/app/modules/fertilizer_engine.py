import json
import os
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _load_json(filename: str):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class FertilizerEngine:
    def __init__(self):
        self._crops_data = _load_json("crop_fertilizer_params.json")
        self._ref_data = _load_json("fertilizer_reference.json")

    def get_crops_list(self) -> list[dict]:
        return [
            {
                "key": c["key"],
                "name": c["name"],
                "icon": c["icon"],
                "target_yield": c["target_yield"],
            }
            for c in self._crops_data["crops"]
        ]

    def get_products_list(self) -> list[dict]:
        return self._ref_data["products"]

    def calculate(
        self,
        crop_key: str,
        target_yield: float,
        soil_n: float,
        soil_p: float,
        soil_k: float,
        soil_om: float,
        soil_ph: float,
    ) -> dict:
        crop = self._find_crop(crop_key)
        if not crop:
            raise ValueError(f"作物 '{crop_key}' 不存在")

        yr = crop["target_yield"]
        if target_yield < yr["min"] or target_yield > yr["max"]:
            raise ValueError(f"目标产量应在 {yr['min']}-{yr['max']} {yr['unit']} 之间")

        uptake = crop["nutrient_uptake_100kg"]
        util = crop["utilization_rate"]
        corr = crop["soil_correction_factor"]

        def calc_nutrient(nutrient_key: str, soil_val: float) -> float:
            nutrient_uptake = (target_yield / 100.0) * uptake[nutrient_key]
            soil_supply = soil_val * 2.25 * corr[nutrient_key]
            needed = (nutrient_uptake - soil_supply) / util[nutrient_key]
            return max(0.0, round(needed, 1))

        n_needed = calc_nutrient("N", soil_n)
        p2o5_needed = calc_nutrient("P2O5", soil_p)
        k2o_needed = calc_nutrient("K2O", soil_k)

        # Product amounts
        urea = round(n_needed / 0.46, 1) if n_needed > 0 else 0
        dap_from_n = n_needed / 0.18 if n_needed > 0 else 0
        dap_from_p = p2o5_needed / 0.46 if p2o5_needed > 0 else 0
        dap = round(min(dap_from_n, dap_from_p), 1)
        n_remaining = max(0, n_needed - dap * 0.18)
        urea_from_remaining = round(n_remaining / 0.46, 1)
        mop = round(k2o_needed / 0.60, 1) if k2o_needed > 0 else 0

        # Micronutrients
        micro = crop["micronutrient"]
        zn_recommendation = micro.get("Zn", 0)
        b_recommendation = micro.get("B", 0)

        # Organic matter > 3% reduces Zn need (higher Zn availability)
        if soil_om > 3.0 and zn_recommendation > 0:
            zn_recommendation = round(zn_recommendation * 0.7, 1)

        znso4 = round(zn_recommendation / 0.23, 1) if zn_recommendation > 0 else 0
        borax = round(b_recommendation / 0.11, 1) if b_recommendation > 0 else 0

        return {
            "crop_key": crop["key"],
            "crop_name": crop["name"],
            "crop_icon": crop["icon"],
            "input": {
                "target_yield": target_yield,
                "yield_unit": yr["unit"],
                "soil_n": soil_n,
                "soil_p": soil_p,
                "soil_k": soil_k,
                "soil_om": soil_om,
                "soil_ph": soil_ph,
            },
            "nutrients": {
                "N": n_needed,
                "P2O5": p2o5_needed,
                "K2O": k2o_needed,
            },
            "products": {
                "urea": urea,
                "urea_from_remaining": urea_from_remaining,
                "dap": dap,
                "mop": mop,
            },
            "micronutrient": {
                "Zn": zn_recommendation,
                "B": b_recommendation,
                "ZnSO4": znso4,
                "Borax": borax,
            },
        }

    def _find_crop(self, key: str) -> Optional[dict]:
        for c in self._crops_data["crops"]:
            if c["key"] == key:
                return c
        return None


fertilizer_engine = FertilizerEngine()
