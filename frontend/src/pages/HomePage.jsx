import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = '/api'

export default function HomePage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard`)
        if (res.data.success) setDashboard(res.data.data)
      } catch (e) {
        console.log('Dashboard fetch failed')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title slide-up">🌾 云上田园</h1>
        <p className="hero-subtitle fade-in">
          气象驱动型元宇宙认养农场 — 用真实天气数据，培育你的专属作物
        </p>
        <Link to="/farm" className="btn btn-primary btn-lg" style={{ animation: 'fadeIn 0.6s ease 0.3s both' }}>
          🌿 进入智慧农场
        </Link>
      </section>

      <div className="page-container">
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p>🌱 正在获取农场数据...</p>
          </div>
        ) : (
          <>
            {dashboard?.alert && (
              <div className="card" style={{ background: '#fff3e0', borderColor: '#ffcc02', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>📢</span>
                  <div>
                    <strong>农场通知：</strong>
                    <span>{dashboard.alert}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid-3">
              <div className="card fade-in">
                <div className="card-title">🌤️ 实时天气</div>
                {dashboard?.weather && (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>
                      {dashboard.weather.weather_desc?.split(/[^\w]/)[0] || '☀️'}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {dashboard.weather.avg_temp}°C
                    </div>
                    <div style={{ color: 'var(--text-light)', marginTop: 8 }}>
                      <span>最高 {dashboard.weather.temp_max}°C</span>
                      <span style={{ margin: '0 12px' }}>|</span>
                      <span>最低 {dashboard.weather.temp_min}°C</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-light)' }}>
                      💧 {dashboard.weather.precipitation}mm | ☀️ {dashboard.weather.sunshine_hours}h | 💨 {dashboard.weather.humidity}%
                    </div>
                  </div>
                )}
              </div>

              <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="card-title">📡 环境传感器</div>
                {dashboard?.sensor ? (
                  <div>
                    {[
                      { label: '空气温度', value: `${dashboard.sensor.air_temperature}°C`, icon: '🌡️' },
                      { label: '空气湿度', value: `${dashboard.sensor.air_humidity}%`, icon: '💧' },
                      { label: '土壤湿度', value: `${dashboard.sensor.soil_moisture}%`, icon: '🌱' },
                      { label: '光照强度', value: `${Math.round(dashboard.sensor.light_intensity)} lux`, icon: '☀️' },
                      { label: 'CO₂浓度', value: `${dashboard.sensor.co2_concentration} ppm`, icon: '🌿' },
                      { label: '土壤pH', value: dashboard.sensor.soil_ph, icon: '🧪' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-light)' }}>{item.icon} {item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-light)' }}>等待传感器数据...</p>
                )}
              </div>

              <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="card-title">🎯 快速入口</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link to="/farm" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                            🏡 进入智慧农场
                          </Link>
                  <Link to="/adoption" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                    🌱 立即认养
                  </Link>
                </div>

                <div style={{ marginTop: 20, padding: 16, background: '#f5faf5', borderRadius: 8 }}>
                  <p style={{ fontSize: 14, color: 'var(--text-light)' }}>
                    💡 <strong>提示：</strong>系统已接入真实天气预报数据，农场中的天气将与现实世界同步变化！
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="card">
                <div className="card-title">📋 关于云上田园</div>
                <div className="grid-4" style={{ marginTop: 16 }}>
                  {[
                    { icon: '🌤️', title: '真实天气驱动', desc: '接入Open-Meteo气象API，作物生长与现实天气同步' },
                    { icon: '🧠', title: 'AI生长模拟', desc: '积温模型(GDD)科学模拟作物各生长阶段' },
                    { icon: '🤖', title: 'AI日记管家', desc: 'GPT驱动每日生长日记与智能问答' },
                    { icon: '🎮', title: '2D监控面板', desc: '可视化网格农场，一目了然掌握作物状态' },
                    { icon: '💝', title: '情感化设计', desc: '第一人称日记让你与作物建立情感连接' },
                    { icon: '📦', title: '虚拟到现实', desc: '认养模式打通虚拟体验到实物收获闭环' },
                    { icon: '⏱️', title: '时间加速器', desc: '30秒预览作物90天完整生长过程' },
                    { icon: '📱', title: '社交分享', desc: '一键生成成长相册与收获证书' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 16, background: '#f9fdf9', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}