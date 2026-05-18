import asyncio
import math
import random
from datetime import datetime, timedelta
from typing import Optional

import httpx
from app.config import settings

class WeatherData:
    def __init__(
        self,
        date: str,
        temp_max: float,
        temp_min: float,
        precipitation: float,
        sunshine_hours: float,
        humidity: float,
        weather_code: int = 0,
    ):
        self.date = date
        self.temp_max = temp_max
        self.temp_min = temp_min
        self.precipitation = precipitation
        self.sunshine_hours = sunshine_hours
        self.humidity = humidity
        self.weather_code = weather_code
        self.avg_temp = (temp_max + temp_min) / 2

    def to_dict(self):
        return {
            "date": self.date,
            "temp_max": round(self.temp_max, 1),
            "temp_min": round(self.temp_min, 1),
            "avg_temp": round(self.avg_temp, 1),
            "precipitation": round(self.precipitation, 1),
            "sunshine_hours": round(self.sunshine_hours, 1),
            "humidity": round(self.humidity, 1),
            "weather_code": self.weather_code,
            "weather_desc": self._describe_weather(),
        }

    def _describe_weather(self):
        if self.weather_code >= 200 and self.weather_code < 300:
            return "雷暴⛈️"
        elif self.weather_code >= 300 and self.weather_code < 600:
            return "降雨🌧️"
        elif self.weather_code >= 600 and self.weather_code < 700:
            return "降雪❄️"
        elif self.precipitation > 5:
            return "暴雨🌊"
        elif self.temp_max > 35:
            return "高温🔥"
        elif self.temp_max > 30 and self.sunshine_hours > 8:
            return "晴朗☀️"
        elif self.precipitation > 0:
            return "多云有雨🌦️"
        elif self.sunshine_hours < 3:
            return "阴天☁️"
        else:
            return "多云⛅"


class RealWeatherFetcher:
    def __init__(self):
        self.base_url = settings.WEATHER_API_BASE
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)

    async def fetch_forecast(
        self, latitude: float = None, longitude: float=None, days: int = 7
    ) -> list[WeatherData]:
        lat = latitude or settings.DEFAULT_LATITUDE
        lon = longitude or settings.DEFAULT_LONGITUDE

        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration,relative_humidity_2m_max,weather_code",
            "timezone": "Asia/Shanghai",
            "forecast_days": days,
        }

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(f"{self.base_url}/forecast", params=params)
                resp.raise_for_status()
                data = resp.json()
                daily = data["daily"]
                weather_list = []
                for i in range(len(daily["time"])):
                    w = WeatherData(
                        date=daily["time"][i],
                        temp_max=daily["temperature_2m_max"][i],
                        temp_min=daily["temperature_2m_min"][i],
                        precipitation=daily["precipitation_sum"][i],
                        sunshine_hours=(daily["sunshine_duration"][i] / 3600) if daily["sunshine_duration"][i] else 0,
                        humidity=daily["relative_humidity_2m_max"][i],
                        weather_code=daily["weather_code"][i],
                    )
                    weather_list.append(w)
                return weather_list
        except Exception as e:
            return None


class WeatherSimulator:
    def __init__(self, latitude: float = None, longitude: float = None):
        self.lat = latitude or settings.DEFAULT_LATITUDE
        self.lon = longitude or settings.DEFAULT_LONGITUDE
        base_temp_map = {
            1: (5, 10), 2: (7, 13), 3: (10, 18),
            4: (15, 23), 5: (19, 27), 6: (22, 30),
            7: (25, 33), 8: (24, 32), 9: (21, 28),
            10: (16, 23), 11: (11, 17), 12: (6, 12),
        }
        self.base_temps = base_temp_map

    def generate_daily(self, date: datetime.date) -> WeatherData:
        month = date.month
        base_min, base_max = self.base_temps[month]
        temp_min = base_min + random.uniform(-3, 3)
        temp_max = base_max + random.uniform(-3, 3)
        if temp_max <= temp_min:
            temp_max = temp_min + random.uniform(2, 6)

        rain_prob = {1: 0.15, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.45, 6: 0.5,
                     7: 0.5, 8: 0.45, 9: 0.4, 10: 0.3, 11: 0.2, 12: 0.15}

        precipitation = 0
        if random.random() < rain_prob[month]:
            precipitation = random.uniform(0.1, 15)

        sunshine_hours = random.uniform(2, 12)
        if precipitation > 5:
            sunshine_hours = random.uniform(0, 3)
        elif precipitation > 0:
            sunshine_hours = random.uniform(1, 6)

        humidity = random.uniform(40, 95)
        if precipitation > 0:
            humidity = random.uniform(70, 99)
        elif temp_max > 30:
            humidity = random.uniform(30, 60)

        weather_code = 0
        if precipitation > 5:
            weather_code = 502
        elif precipitation > 0:
            weather_code = 500
        elif temp_max > 35:
            weather_code = 0
        elif sunshine_hours < 3:
            weather_code = 804
        elif sunshine_hours > 8:
            weather_code = 800

        return WeatherData(
            date=date.isoformat(),
            temp_max=round(temp_max, 1),
            temp_min=round(temp_min, 1),
            precipitation=round(precipitation, 1),
            sunshine_hours=round(sunshine_hours, 1),
            humidity=round(humidity, 1),
            weather_code=weather_code,
        )

    def generate_historical(self, start_date: datetime.date, days: int) -> list[WeatherData]:
        result = []
        for i in range(days):
            d = start_date + timedelta(days=i)
            result.append(self.generate_daily(d))
        return result


class WeatherService:
    def __init__(self):
        self.fetcher = RealWeatherFetcher()
        self.simulator = WeatherSimulator()
        self._current_weather = None

    async def get_forecast(self, days: int = 7) -> list[dict]:
        real_data = await self.fetcher.fetch_forecast(days=days)
        if real_data:
            self._current_weather = real_data
            return [w.to_dict() for w in real_data]

        simulated = self.simulator.generate_historical(datetime.now().date(), days)
        self._current_weather = simulated
        return [w.to_dict() for w in simulated]

    def get_historical(self, start_date: datetime.date, days: int) -> list[dict]:
        return [w.to_dict() for w in self.simulator.generate_historical(start_date, days)]

    def get_current_weather(self) -> Optional[dict]:
        if self._current_weather and len(self._current_weather) > 0:
            return self._current_weather[0].to_dict()
        return None

    def is_extreme_weather(self, weather: dict) -> Optional[str]:
        if weather["temp_max"] > 38:
            return f"🔥高温预警：今日最高温{weather['temp_max']}℃，请注意作物防晒保湿！"
        if weather["temp_min"] < -2:
            return f"❄️寒潮预警：今日最低温{weather['temp_min']}℃，请注意作物防寒！"
        if weather["precipitation"] > 20:
            return f"🌊暴雨预警：今日降雨量{weather['precipitation']}mm，请注意排水！"
        return None


weather_service = WeatherService()