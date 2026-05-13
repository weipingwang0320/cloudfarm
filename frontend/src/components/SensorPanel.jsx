import React from 'react'

const SENSOR_ITEMS = [
  { key: 'air_temperature', label: '气温', icon: '🌡️', unit: '°C', bg: '#fff3e0' },
  { key: 'air_humidity', label: '空气湿度', icon: '💧', unit: '%', bg: '#e3f2fd' },
  { key: 'soil_moisture', label: '土壤湿度', icon: '🌱', unit: '%', bg: '#e8f5e9' },
  { key: 'soil_ph', label: 'pH值', icon: '🧪', unit: '', bg: '#f3e5f5' },
  { key: 'light_intensity', label: '光照', icon: '☀️', unit: ' lux', bg: '#fff8e1', round: true },
  { key: 'co2_concentration', label: 'CO₂', icon: '🌿', unit: ' ppm', bg: '#e0f2f1' },
]

export default function SensorPanel({ sensor }) {
  return (
    <div>
      <div className="panel-header">
        <div className="panel-icon" style={{ background: '#e8f5e9' }}>📡</div>
        <span className="panel-title">传感器数据</span>
        {sensor && (
          <span className="panel-badge">
            {new Date(sensor.timestamp || Date.now()).toLocaleTimeString()}
          </span>
        )}
      </div>

      {sensor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SENSOR_ITEMS.map(item => {
            const val = sensor[item.key]
            if (val === undefined || val === null) return null
            const display = item.round ? Math.round(val) : val
            return (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px', borderRadius: 8,
                background: item.bg,
              }}>
                <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text-light)', flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {display}{item.unit}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 12 }}>
          <span style={{ fontSize: 24, opacity: 0.3 }}>📡</span>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 6 }}>等待传感器数据...</p>
          <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>每10分钟自动更新</p>
        </div>
      )}
    </div>
  )
}