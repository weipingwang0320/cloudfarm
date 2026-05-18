import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = '/api'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80'
const WEATHER_IMAGE = 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80'
const SENSOR_IMAGE = 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80'
const CHAT_IMAGE = 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80'

export default function HomePage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <div onMouseMove={handleMouseMove}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(1.1) translate(${(mousePos.x - 0.5) * -10}px, ${(mousePos.y - 0.5) * -10}px)`,
          transition: 'transform 0.3s ease-out',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(45,45,45,0.4) 0%, rgba(93,78,55,0.6) 100%)',
        }} />
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(218,165,32,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '900px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(52px, 10vw, 100px)',
            color: '#FAF8F5',
            marginBottom: '24px',
            textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            letterSpacing: '0.1em',
            animation: 'slideUp 1s ease both',
          }}>
            云上田园
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 26px)',
            color: 'rgba(250,248,245,0.9)',
            marginBottom: '48px',
            lineHeight: '1.8',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            animation: 'slideUp 1s ease 0.2s both',
          }}>
            实时气象监测 · AI 智能农事助手
          </p>
          <div style={{ animation: 'slideUp 1s ease 0.4s both' }}>
            <Link
              to="/farm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 48px',
                background: 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: 'var(--font-body)',
                borderRadius: '16px',
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(90,114,71,0.4)',
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(90,114,71,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(90,114,71,0.4)'
              }}
            >
              <span style={{ fontSize: '22px' }}>进入气象监测站</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(250,248,245,0.7)',
          fontSize: '14px',
          letterSpacing: '0.2em',
          animation: 'bounce 2s infinite',
        }}>
          <div style={{ marginBottom: '8px' }}>探索更多</div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ padding: '80px 32px', background: 'var(--rice-white)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: 'var(--earth-dark)',
              marginBottom: '16px',
            }}>
              智慧农场气象站
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              接入真实气象数据，搭配 AI 智能助手，让农事管理更科学
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}>
            {[
              {
                image: WEATHER_IMAGE,
                title: '实时气象监测',
                desc: '接入 Open-Meteo 全球气象数据，实时获取温度、降水、日照、湿度等精准信息',
                icon: '🌤️',
              },
              {
                image: SENSOR_IMAGE,
                title: '环境传感器',
                desc: '模拟空气温湿度、土壤湿度、光照强度、CO₂浓度等六项环境指标',
                icon: '📡',
              },
              {
                image: CHAT_IMAGE,
                title: 'AI 农事助手',
                desc: '基于智谱 GLM 大模型，随时解答种植疑问，提供专业的农事建议',
                icon: '🤖',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: 'var(--shadow-soft)',
                  transition: 'all 0.5s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-medium)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
                }}
              >
                <div style={{
                  height: '220px',
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 50%, rgba(45,45,45,0.7) 100%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '20px',
                    fontSize: '32px',
                  }}>
                    {item.icon}
                  </div>
                </div>
                <div style={{ padding: '28px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    color: 'var(--earth-dark)',
                    marginBottom: '12px',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.8',
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Dashboard */}
      <section style={{ padding: '60px 32px', background: 'var(--paper-cream)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid var(--border-light)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: 'var(--text-muted)' }}>正在获取气象数据...</p>
            </div>
          ) : (
            <>
              {dashboard?.alert && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.15) 0%, rgba(232,168,124,0.1) 100%)',
                  border: '1px solid rgba(218,165,32,0.3)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(218,165,32,0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}>
                    📢
                  </div>
                  <div>
                    <strong style={{ color: 'var(--earth-dark)' }}>气象预警</strong>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{dashboard.alert}</p>
                  </div>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
              }}>
                {/* Weather Card */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(135,206,235,0.2) 0%, rgba(232,168,124,0.1) 100%)',
                    padding: '28px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'white',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}>
                        ☁️
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--earth-dark)' }}>实时天气</span>
                    </div>
                    {dashboard?.weather && (
                      <div>
                        <div style={{
                          fontSize: '56px',
                          fontWeight: '700',
                          color: 'var(--earth-dark)',
                          marginBottom: '8px',
                        }}>
                          {dashboard.weather.avg_temp}°C
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                          {dashboard.weather.weather_desc || '天气晴好'}
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '12px',
                        }}>
                          <div style={{ background: 'white', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>最高</div>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                              {dashboard.weather.temp_max}°C
                            </div>
                          </div>
                          <div style={{ background: 'white', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>最低</div>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                              {dashboard.weather.temp_min}°C
                            </div>
                          </div>
                          <div style={{ background: 'white', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>降水量</div>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                              {dashboard.weather.precipitation}mm
                            </div>
                          </div>
                          <div style={{ background: 'white', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>日照时长</div>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                              {dashboard.weather.sunshine_hours}h
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sensor Card */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'var(--paper-cream)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      📡
                    </div>
                    <span style={{ fontWeight: '600', color: 'var(--earth-dark)' }}>环境传感器</span>
                  </div>
                  {dashboard?.sensor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { label: '空气温度', value: `${dashboard.sensor.air_temperature}°C`, bar: true, percent: (dashboard.sensor.air_temperature / 40) * 100 },
                        { label: '空气湿度', value: `${dashboard.sensor.air_humidity}%`, bar: true, percent: dashboard.sensor.air_humidity },
                        { label: '土壤湿度', value: `${dashboard.sensor.soil_moisture}%`, bar: true, percent: dashboard.sensor.soil_moisture },
                        { label: '光照强度', value: `${Math.round(dashboard.sensor.light_intensity)} lux`, bar: false },
                        { label: 'CO₂浓度', value: `${dashboard.sensor.co2_concentration} ppm`, bar: false },
                        { label: '土壤pH', value: dashboard.sensor.soil_ph, bar: false },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.label}</span>
                            <span style={{ fontWeight: '600', color: 'var(--earth-dark)' }}>{item.value}</span>
                          </div>
                          {item.bar && (
                            <div className="progress-bar">
                              <div className="progress-fill green" style={{ width: `${Math.min(item.percent, 100)}%` }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                      等待传感器数据...
                    </p>
                  )}
                </div>

                {/* CTA Card */}
                <div className="card" style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%)',
                  color: 'white',
                }}>
                  <div style={{ marginBottom: '28px' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      marginBottom: '12px',
                      color: 'white',
                    }}>
                      AI 农事助手
                    </h3>
                    <p style={{ opacity: 0.9, lineHeight: '1.7' }}>
                      遇到种植难题？随时向智能 AI 助手提问，获取专业的农事建议和气象分析
                    </p>
                  </div>
                  <Link
                    to="/farm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px 24px',
                      background: 'white',
                      color: 'var(--primary)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    进入气象监测站
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}>
                    系统已接入 Open-Meteo 真实天气数据和智谱 AI 大模型
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 32px', background: 'var(--rice-white)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: 'var(--earth-dark)',
            }}>
              核心功能
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: '🌤️', title: '实时天气', desc: '接入 Open-Meteo 全球气象数据，实时同步' },
              { icon: '📊', title: '环境监测', desc: '六项环境传感器指标，精准掌握环境状态' },
              { icon: '🤖', title: 'AI 问答', desc: '智谱 GLM 大模型驱动，智能农事咨询' },
              { icon: '📅', title: '天气预报', desc: '未来3天逐日预报，提前规划农事活动' },
              { icon: '📍', title: '本地化数据', desc: '基于武汉地理位置的精准气象服务' },
              { icon: '⚡', title: '实时更新', desc: '数据自动刷新，时刻掌握最新动态' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border-light)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--paper-cream)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                }}>
                  {item.icon}
                </div>
                <h4 style={{ fontWeight: '600', color: 'var(--earth-dark)', marginBottom: '8px' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
      `}</style>
    </div>
  )
}
