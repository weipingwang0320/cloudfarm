import React from 'react'

const SENSOR_ITEMS = [
  { key: 'air_temperature', label: '空气温度', icon: 'temp', unit: '°C', color: '#E8A87C' },
  { key: 'air_humidity', label: '空气湿度', icon: 'humidity', unit: '%', color: '#87CEEB' },
  { key: 'soil_moisture', label: '土壤湿度', icon: 'soil', unit: '%', color: '#5A7247' },
  { key: 'light_intensity', label: '光照强度', icon: 'light', unit: 'lux', color: '#DAA520', round: true },
  { key: 'co2_concentration', label: 'CO₂浓度', icon: 'co2', unit: 'ppm', color: '#7A8B6E' },
  { key: 'soil_ph', label: '土壤pH', icon: 'ph', unit: '', color: '#8B7355' },
]

const SensorIcon = ({ type, color }) => {
  const icons = {
    temp: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
      </svg>
    ),
    humidity: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
    soil: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
        <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
      </svg>
    ),
    light: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    ),
    co2: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M5.5 8.5c2-2 5-2 6.5 0s1.5 4 0 6-4.5 2-6.5 0M18.5 15.5c-2 2-5 2-6.5 0s-1.5-4 0-6 4.5-2 6.5 0"/>
      </svg>
    ),
    ph: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2"/>
        <path d="M8.5 2h7"/>
      </svg>
    ),
  }
  return icons[type] || null
}

export default function SensorPanel({ sensor }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'rgba(90,114,71,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20v-6M6 20V10M18 20V4"/>
          </svg>
        </div>
        <span className="panel-title">环境传感器</span>
        {sensor && (
          <span className="panel-badge">
            {new Date(sensor.timestamp || Date.now()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {sensor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SENSOR_ITEMS.map(item => {
            const val = sensor[item.key]
            if (val === undefined || val === null) return null
            const display = item.round ? Math.round(val) : val
            return (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--paper-cream)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <SensorIcon type={item.icon} color={item.color} />
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', flex: 1 }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--earth-dark)',
                }}>
                  {display}{item.unit}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--paper-cream)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20v-6M6 20V10M18 20V4"/>
            </svg>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>等待传感器数据...</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.7 }}>每10分钟自动更新</p>
        </div>
      )}
    </div>
  )
}
