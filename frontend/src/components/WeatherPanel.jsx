import React from 'react'

export default function WeatherPanel({ weather, forecast }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'linear-gradient(135deg, rgba(135,206,235,0.3) 0%, rgba(232,168,124,0.2) 100%)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--sky-blue)' }}>
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          </svg>
        </div>
        <span className="panel-title">实时天气</span>
        {weather && (
          <span className="panel-badge">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>

      {weather ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: weather.weather_desc?.includes('雨')
                ? 'linear-gradient(135deg, rgba(100,130,150,0.2) 0%, rgba(80,110,130,0.1) 100%)'
                : weather.weather_desc?.includes('云') || weather.weather_desc?.includes('阴')
                  ? 'linear-gradient(135deg, rgba(180,180,180,0.2) 0%, rgba(150,150,150,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(255,200,100,0.3) 0%, rgba(255,180,80,0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              flexShrink: 0,
            }}>
              {weather.weather_desc?.includes('雨') ? '🌧'
                : weather.weather_desc?.includes('云') || weather.weather_desc?.includes('阴') ? '☁'
                  : '☀'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                lineHeight: 1,
                color: 'var(--earth-dark)',
                fontFamily: 'var(--font-display)',
              }}>
                {Math.round(weather.avg_temp || weather.temp_max || 0)}°
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
              }}>
                {weather.weather_desc || '天气晴好'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
          }}>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(232,168,124,0.15) 0%, rgba(218,165,32,0.1) 100%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>最高</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                {Math.round(weather.temp_max)}°
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(135,206,235,0.2) 0%, rgba(100,150,180,0.1) 100%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>最低</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                {Math.round(weather.temp_min)}°
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'var(--paper-cream)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>降水</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                {weather.precipitation || 0}mm
              </div>
            </div>
          </div>

          {forecast && forecast.length > 1 && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              gap: '8px',
              padding: '12px',
              background: 'var(--paper-cream)',
              borderRadius: '12px',
            }}>
              {forecast.slice(1, 4).map((day, i) => (
                <div key={i} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 0',
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}>
                    {i === 0 ? '明天' : i === 1 ? '后天' : `D+${i + 1}`}
                  </div>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {day.weather_desc?.includes('雨') ? '🌧'
                      : day.weather_desc?.includes('云') || day.weather_desc?.includes('阴') ? '☁' : '☀'}
                  </div>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '15px',
                    color: 'var(--earth-dark)',
                  }}>
                    {Math.round(day.avg_temp)}°
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>加载天气数据...</p>
        </div>
      )}
    </div>
  )
}
