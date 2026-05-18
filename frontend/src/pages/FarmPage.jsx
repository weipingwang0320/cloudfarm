import React, { useState, useEffect } from 'react'
import axios from 'axios'
import WeatherPanel from '../components/WeatherPanel'
import SensorPanel from '../components/SensorPanel'
import ChatBot from '../components/ChatBot'

const API_BASE = '/api'

export default function FarmPage() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [sensor, setSensor] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeather()
    fetchSensor()
    const wInterval = setInterval(fetchWeather, 60000)
    const sInterval = setInterval(fetchSensor, 300000)
    return () => {
      clearInterval(wInterval)
      clearInterval(sInterval)
    }
  }, [])

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${API_BASE}/weather/forecast?days=3`)
      if (res.data.success) {
        setWeather(res.data.data[0])
        setForecast(res.data.data)
      }
    } catch (e) {
      console.log('Weather fetch failed')
    }
    setLoading(false)
  }

  const fetchSensor = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sensors/current`)
      if (res.data.success) setSensor(res.data.data.data)
    } catch (e) {
      console.log('Sensor fetch failed')
    }
  }

  const getWeatherIcon = (desc) => {
    if (!desc) return '☀'
    if (desc.includes('雨')) return '🌧'
    if (desc.includes('云') || desc.includes('阴')) return '☁'
    if (desc.includes('晴')) return '☀'
    if (desc.includes('雪')) return '❄'
    return '☀'
  }

  const getWeatherBg = (desc) => {
    if (!desc || desc.includes('晴')) {
      return 'linear-gradient(135deg, #87CEEB 0%, #E8F4F8 30%, #FAF8F5 100%)'
    }
    if (desc.includes('雨')) {
      return 'linear-gradient(135deg, #5B7B8A 0%, #8BA8B8 30%, #C8D8E0 100%)'
    }
    if (desc.includes('云') || desc.includes('阴')) {
      return 'linear-gradient(135deg, #9E9E9E 0%, #C8C8C8 30%, #E8E8E8 100%)'
    }
    return 'linear-gradient(135deg, #87CEEB 0%, #E8F4F8 30%, #FAF8F5 100%)'
  }

  const currentHour = new Date().getHours()
  const isNight = currentHour < 6 || currentHour >= 19

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      background: loading
        ? 'var(--rice-white)'
        : getWeatherBg(weather?.weather_desc),
      transition: 'background 0.8s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative floating elements */}
      {!loading && weather && (
        <>
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: weather?.weather_desc?.includes('雨')
              ? 'radial-gradient(circle, rgba(100,130,150,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,200,100,0.12) 0%, transparent 70%)',
            animation: 'float 12s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(90,114,71,0.06) 0%, transparent 70%)',
            animation: 'float 15s ease-in-out infinite reverse',
          }} />
        </>
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 32px',
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '120px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              border: '3px solid var(--border-light)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>正在获取气象数据...</p>
          </div>
        ) : (
          <>
            {/* Weather Hero */}
            <div style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.8)',
              marginBottom: '28px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '32px',
              }}>
                {/* Left: Main weather */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      fontWeight: '500',
                    }}>
                      {isNight ? '🌙 晚间' : '☀ 日间'} · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </span>
                    <span style={{
                      padding: '3px 12px',
                      borderRadius: '20px',
                      background: 'rgba(90,114,71,0.1)',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      实时
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '72px',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
                      animation: 'float 4s ease-in-out infinite',
                    }}>
                      {getWeatherIcon(weather?.weather_desc)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '72px',
                        fontWeight: '300',
                        color: 'var(--earth-dark)',
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1,
                        letterSpacing: '-2px',
                      }}>
                        {Math.round(weather?.avg_temp || weather?.temp_max || 0)}°
                      </div>
                      <div style={{
                        fontSize: '20px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        fontWeight: '500',
                      }}>
                        {weather?.weather_desc || '天气晴好'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {[
                      { label: '最高温', value: `${Math.round(weather?.temp_max || 0)}°`, color: '#E8A87C' },
                      { label: '最低温', value: `${Math.round(weather?.temp_min || 0)}°`, color: '#87CEEB' },
                      { label: '降水量', value: `${weather?.precipitation || 0}mm`, color: '#5B7B8A' },
                      { label: '日照', value: `${weather?.sunshine_hours || 0}h`, color: '#DAA520' },
                      { label: '湿度', value: `${Math.round(weather?.humidity || 0)}%`, color: '#5A7247' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        background: `${item.color}12`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Quick stats */}
                <div style={{
                  background: 'var(--paper-cream)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  minWidth: '200px',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '500' }}>
                    📍 观测位置
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--earth-dark)', marginBottom: '4px' }}>
                    武汉 · 洪山
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    北纬 30.50° 东经 114.34°
                  </div>
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-light)',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                      数据来源
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '500' }}>
                        Open-Meteo API
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast */}
              {forecast.length > 1 && (
                <div style={{
                  marginTop: '28px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--border-light)',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--earth-dark)',
                    marginBottom: '16px',
                  }}>
                    未来天气预报
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(forecast.length, 4)}, 1fr)`,
                    gap: '12px',
                  }}>
                    {forecast.slice(1, 5).map((day, i) => (
                      <div key={i} style={{
                        padding: '16px',
                        borderRadius: '14px',
                        background: 'var(--rice-white)',
                        textAlign: 'center',
                        border: '1px solid var(--border-light)',
                        transition: 'all 0.3s ease',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-soft)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--earth-dark)', marginBottom: '8px' }}>
                          {i === 0 ? '明天' : i === 1 ? '后天' : `第${i + 1}天`}
                        </div>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                          {getWeatherIcon(day.weather_desc)}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--earth-dark)' }}>
                          {Math.round(day.avg_temp)}°
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          H:{Math.round(day.temp_max)}° L:{Math.round(day.temp_min)}°
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {day.precipitation || 0}mm
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sensor Section */}
            <div style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.8)',
            }}>
              <SensorPanel sensor={sensor} />
            </div>
          </>
        )}
      </div>

      {/* AI Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 50,
          width: '60px',
          height: '60px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(90,114,71,0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(90,114,71,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(90,114,71,0.4)'
        }}
        title="AI 农场助手"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1"/>
          <circle cx="12" cy="10" r="1"/>
          <circle cx="15" cy="10" r="1"/>
        </svg>
      </button>

      {/* ChatBot Modal */}
      {showChat && (
        <ChatBot
          onClose={() => setShowChat(false)}
        />
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
