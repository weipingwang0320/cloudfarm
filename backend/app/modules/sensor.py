import math
import random
from datetime import datetime
from typing import Dict, List


class SensorSimulator:
    def __init__(self, device_id: str = "SENSOR-001"):
        self.device_id = device_id

    def _apply_diurnal_curve(self, hour: int, base_value: float, amplitude: float) -> float:
        curve = math.sin((hour - 6) * math.pi / 12)
        if hour < 6 or hour > 18:
            curve = 0.1
        return base_value + amplitude * curve

    def _add_noise(self, value: float, noise_pct: float = 0.02) -> float:
        noise = value * random.uniform(-noise_pct, noise_pct)
        return value + noise

    def generate_reading(
        self,
        weather_temp_max: float,
        weather_temp_min: float,
        weather_humidity: float,
        precipitation: float,
        sunshine_hours: float,
        hour: int = None,
    ) -> Dict:
        if hour is None:
            hour = datetime.now().hour

        base_air_temp = (weather_temp_max + weather_temp_min) / 2
        air_temp = self._apply_diurnal_curve(hour, base_air_temp, (weather_temp_max - weather_temp_min) / 2)
        air_temp = self._add_noise(air_temp, 0.03)

        base_humidity = weather_humidity
        if precipitation > 0:
            base_humidity = min(99, base_humidity + 15)
        air_humidity = self._add_noise(base_humidity, 0.05)
        air_humidity = max(10, min(100, air_humidity))

        soil_moisture = 45
        if precipitation > 5:
            soil_moisture += precipitation * 1.5
        elif precipitation > 0:
            soil_moisture += 10
        if sunshine_hours > 6 and precipitation == 0:
            soil_moisture -= sunshine_hours * 0.8
        soil_moisture = self._add_noise(soil_moisture, 0.05)
        soil_moisture = max(5, min(100, soil_moisture))

        light_intensity = 0
        if 6 <= hour <= 18:
            peak_hours = sunshine_hours
            relative_hour = (hour - 6) / 12
            light_intensity = 1000 * peak_hours / 12 * math.sin(relative_hour * math.pi)
            if precipitation > 0:
                light_intensity *= 0.3
        light_intensity = self._add_noise(light_intensity, 0.1)
        light_intensity = max(0, light_intensity)

        soil_ph = self._add_noise(6.5, 0.03)
        co2 = self._add_noise(410, 0.02)

        timestamp = datetime.now().isoformat()

        return {
            "device_id": self.device_id,
            "timestamp": timestamp,
            "data": {
                "air_temperature": round(air_temp, 1),
                "air_humidity": round(air_humidity, 1),
                "soil_moisture": round(soil_moisture, 1),
                "soil_ph": round(soil_ph, 2),
                "co2_concentration": round(co2, 1),
                "light_intensity": round(light_intensity, 1),
            },
        }

    def generate_batch(self, weather: dict, count: int = 24) -> List[Dict]:
        readings = []
        for hour in range(0, 24, 24 // count):
            readings.append(
                self.generate_reading(
                    weather_temp_max=weather["temp_max"],
                    weather_temp_min=weather["temp_min"],
                    weather_humidity=weather["humidity"],
                    precipitation=weather["precipitation"],
                    sunshine_hours=weather["sunshine_hours"],
                    hour=hour,
                )
            )
        return readings


sensor_simulator = SensorSimulator()