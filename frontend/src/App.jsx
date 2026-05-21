import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FarmPage from './pages/FarmPage'
import CalendarPage from './pages/CalendarPage'
import FertilizerCalculatorPage from './pages/FertilizerCalculatorPage'
import DiseaseIdentifierPage from './pages/DiseaseIdentifierPage'
import AIAssistantPage from './pages/AIAssistantPage'
import axios from 'axios'
import './App.css'

const API_BASE = '/api'

function App() {
  const [weather, setWeather] = useState(null)
  const [weatherAlert, setWeatherAlert] = useState('ok')
  const location = useLocation()

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${API_BASE}/weather/current`)
      if (res.data.success) {
        setWeather(res.data.data)
        if (res.data.alert) {
          setWeatherAlert('warning')
        } else {
          setWeatherAlert('ok')
        }
      }
    } catch (e) {
      console.log('Weather fetch failed, using simulated data')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
                <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              </svg>
            </div>
            <span className="logo-text">云上田园</span>
          </Link>
        </div>

        <nav className="main-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            首页
          </Link>
          <Link
            to="/farm"
            className={`nav-link ${isActive('/farm') ? 'active' : ''}`}
          >
            气象监测站
          </Link>
          <Link
            to="/calendar"
            className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
          >
            生长日历
          </Link>
          <Link
            to="/fertilizer"
            className={`nav-link ${isActive('/fertilizer') ? 'active' : ''}`}
          >
            施肥计算
          </Link>
          <Link
            to="/disease"
            className={`nav-link ${isActive('/disease') ? 'active' : ''}`}
          >
            病害识别
          </Link>
          <Link
            to="/assistant"
            className={`nav-link ${isActive('/assistant') ? 'active' : ''}`}
          >
            AI助手
          </Link>
        </nav>

        <div className="header-right">
          {weather && (
            <div className={`weather-badge ${weatherAlert}`}>
              <span className="weather-icon">
                {weather.weather_desc?.includes('雨') ? '🌧'
                  : weather.weather_desc?.includes('云') || weather.weather_desc?.includes('阴') ? '☁'
                  : '☀'}
              </span>
              <span className="weather-temp">{weather.avg_temp}°C</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/farm" element={<FarmPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/fertilizer" element={<FertilizerCalculatorPage />} />
          <Route path="/disease" element={<DiseaseIdentifierPage />} />
          <Route path="/assistant" element={<AIAssistantPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
