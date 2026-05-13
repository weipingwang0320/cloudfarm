import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FarmPage from './pages/FarmPage'
import axios from 'axios'
import './App.css'

const API_BASE = '/api'

function App() {
  const [weather, setWeather] = useState(null)
  const [healthStatus, setHealthStatus] = useState('ok')
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
          setHealthStatus('warning')
        } else {
          setHealthStatus('ok')
        }
      }
    } catch (e) {
      console.log('Weather fetch failed, using simulated data')
    }
  }

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">云上田园</span>
          </Link>
        </div>
        <nav className="main-nav">
          <Link to="/" className={isActive('/')}>首页</Link>
          <Link to="/farm" className={isActive('/farm')}>智慧农场</Link>
        </nav>
        <div className="header-right">
          {weather && (
            <div className={`weather-badge ${healthStatus}`}>
              <span className="weather-icon">{weather.weather_desc?.split(/[^\w]/)[0] || '☀️'}</span>
              <span className="weather-temp">{weather.avg_temp}°C</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/farm" element={<FarmPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App