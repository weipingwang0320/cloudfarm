import React from 'react'

export default function WeatherPanel({ weather, forecast }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-icon" style={{ background: '#e3f2fd' }}>🌤️</div>
        <span className="panel-title">实时天气</span>
        {weather && (
          <span className="panel-badge">{new Date().toLocaleTimeString()}</span>
        )}
      </div>

      {weather ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
            }}>
              {weather.weather_desc?.includes('雨') ? '🌧️'
                : weather.weather_desc?.includes('云') || weather.weather_desc?.includes('阴') ? '☁️'
                  : '☀️'}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
                {Math.round(weather.avg_temp || weather.temp_max || 0)}°C
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>
                {weather.weather_desc || '未知'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 8, marginTop: 10,
            fontSize: 12, color: 'var(--text-light)',
          }}>
            <span style={{
              padding: '2px 10px', borderRadius: 10, background: '#fff3e0',
              fontWeight: 600, color: '#e65100',
            }}>
              ↑{Math.round(weather.temp_max)}°C
            </span>
            <span style={{
              padding: '2px 10px', borderRadius: 10, background: '#e3f2fd',
              fontWeight: 600, color: '#1565c0',
            }}>
              ↓{Math.round(weather.temp_min)}°C
            </span>
            <span style={{
              padding: '2px 10px', borderRadius: 10, background: '#e8eaf6',
              fontWeight: 600, color: '#283593',
            }}>
              💧{weather.precipitation || 0}mm
            </span>
          </div>

          {forecast && forecast.length > 1 && (
            <div style={{
              marginTop: 10, display: 'flex', gap: 6,
              padding: 8, background: '#f8faf8', borderRadius: 10,
            }}>
              {forecast.slice(1, 4).map((day, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center',
                  fontSize: 12,
                }}>
                  <div style={{ color: '#999', marginBottom: 2 }}>
                    {i === 0 ? '明天' : i === 1 ? '后天' : `D+${i + 1}`}
                  </div>
                  <div style={{ fontSize: 11 }}>
                    {day.weather_desc?.includes('雨') ? '🌧️'
                      : day.weather_desc?.includes('云') || day.weather_desc?.includes('阴') ? '☁️' : '☀️'}
                  </div>
                  <div style={{ fontWeight: 600, color: '#333', marginTop: 1 }}>
                    {Math.round(day.avg_temp)}°
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>加载天气数据中...</p>
      )}
    </div>
  )
}