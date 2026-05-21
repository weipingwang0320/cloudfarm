import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = '/api'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80'
const WEATHER_IMAGE = 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80'
const SENSOR_IMAGE = 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80'
const CHAT_IMAGE = 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80'
const CALENDAR_IMAGE = 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&q=80'
const FERTILIZER_IMAGE = 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&q=80'
const DISEASE_IMAGE = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80'
const ASSISTANT_IMAGE = 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80'

const features = [
  { image: WEATHER_IMAGE, title: '实时气象监测', desc: '接入 Open-Meteo 全球气象数据，实时获取温度、降水、日照、湿度等精准信息', icon: 'weather', link: '/farm' },
  { image: CHAT_IMAGE, title: 'AI 农场助手', desc: '基于智谱 GLM-4.5-Air 大模型，随时解答种植疑问，提供专业农事建议', icon: 'chat', link: '/assistant' },
  { image: CALENDAR_IMAGE, title: '生长日历', desc: '选择作物与地区，自动生成关键农事节点时间轴，支持导出PDF与收藏', icon: 'calendar', link: '/calendar' },
  { image: FERTILIZER_IMAGE, title: '施肥量计算器', desc: '目标产量法精准计算N/P/K及微量元素用量，折合商品肥料实物量', icon: 'fertilizer', link: '/fertilizer' },
  { image: DISEASE_IMAGE, title: '病害识别', desc: '上传作物图片，AI 视觉模型自动识别病虫害并给出具体防治方案', icon: 'disease', link: '/disease' },
  { image: SENSOR_IMAGE, title: '环境传感器', desc: '六项环境指标实时监测：空气温湿度、土壤湿度、光照、CO₂、pH', icon: 'sensor', link: '/farm' },
]

const iconSvgs = {
  weather: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3.5a4 4 0 0 0-4 4c0 1 .4 2 1 2.8"/>
      <path d="M3 14.5a4 4 0 0 0 4 4h10a4 4 0 1 0-1.2-7.8A4.5 4.5 0 0 0 8 8.5a4.5 4.5 0 0 0-3.5 1.8"/>
      <circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><circle cx="12" cy="17.5" r="1.5"/>
    </svg>
  ),
  sensor: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 17v-4"/><path d="M12 17v-7"/><path d="M16 17v-3"/><circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="16" cy="9" r="1.5"/>
    </svg>
  ),
  chat: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.8 0-3.5-.6-4.8-1.5L3 20l1.5-4.2A8.5 8.5 0 1 1 21 11.5z"/><circle cx="8.5" cy="11.5" r="1"/><circle cx="12.5" cy="11.5" r="1"/><circle cx="16.5" cy="11.5" r="1"/>
    </svg>
  ),
  calendar: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M10 14v4"/>
    </svg>
  ),
  fertilizer: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v4l3 6v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6l3-6V3z"/><path d="M9 8h6"/><path d="M12 12v4"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/>
    </svg>
  ),
  disease: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M8 11h6"/><path d="M11 8v6"/>
    </svg>
  ),
}

// Scroll reveal hook
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.unobserve(el)
      }
    }, { threshold, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}

// --- Animated Counter ---
function AnimatedCounter({ value, suffix = '', duration = 800 }) {
  const [count, setCount] = useState(0)
  const [ref, visible] = useScrollReveal(0.5)

  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const from = 0
    const to = parseFloat(value) || 0
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(from + (to - from) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, value, duration])

  const display = typeof value === 'number' && value % 1 !== 0 ? count.toFixed(1) : Math.round(count)

  return <span ref={ref}>{display}{suffix}</span>
}

// --- Feature Card with 3D tilt ---
function FeatureCard({ item, index }) {
  const [ref, visible] = useScrollReveal(0.1)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * 12, y: x * 12 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setGlow(false)
  }

  return (
    <div
      ref={ref}
      onClick={() => { if (item.link) window.location.href = item.link }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setGlow(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#fff',
        cursor: item.link ? 'pointer' : 'default',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${visible ? 0 : 40}px)`,
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s ease, box-shadow 0.4s ease',
        transitionDelay: `${index * 0.1}s`,
        boxShadow: glow
          ? '0 24px 64px rgba(90,114,71,0.18), 0 0 0 1px rgba(90,114,71,0.15)'
          : '0 4px 20px rgba(93,78,55,0.08)',
      }}
    >
      {/* Image */}
      <div style={{ height: '200px', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(35,30,20,0.75) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '14px', left: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
          {iconSvgs[item.icon] ? iconSvgs[item.icon]('#fff') : iconSvgs.weather('#fff')}
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: '24px 22px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#3D3929', marginBottom: '8px', letterSpacing: '0.02em' }}>
          {item.title}
        </h3>
        <p style={{ fontSize: '13.5px', color: '#8B7355', lineHeight: '1.7', margin: 0 }}>
          {item.desc}
        </p>
      </div>
    </div>
  )
}

// --- Floating Particles ---
function FloatingParticles() {
  const particles = useRef([])
  if (particles.current.length === 0) {
    particles.current = Array.from({ length: 18 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 8 + Math.random() * 16,
      delay: Math.random() * 10,
      opacity: 0.06 + Math.random() * 0.12,
    }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.current.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: '#5A7247',
            opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ==================== MAIN PAGE ====================
export default function HomePage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heroMouse, setHeroMouse] = useState({ x: 0.5, y: 0.5 })
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard`)
        if (res.data.success) setDashboard(res.data.data)
      } catch (e) { console.log('Dashboard fetch failed') }
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroParallax = useCallback((e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    setHeroMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  const titleChars = ['云', '上', '田', '园']

  return (
    <div style={{ background: '#FAF8F5' }}>
      <style>{`
        @keyframes charFloat1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-18px) rotate(1.5deg); }
          50% { transform: translateY(-6px) rotate(0deg); }
          75% { transform: translateY(-24px) rotate(-1deg); }
        }
        @keyframes charFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-22px) rotate(-1.5deg); }
          55% { transform: translateY(-3px) rotate(0.5deg); }
          80% { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes charFloat3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(-10px) rotate(0.5deg); }
          45% { transform: translateY(-28px) rotate(-1deg); }
          70% { transform: translateY(-8px) rotate(0deg); }
        }
        @keyframes charFloat4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          35% { transform: translateY(-14px) rotate(-1deg); }
          60% { transform: translateY(-26px) rotate(1.5deg); }
          85% { transform: translateY(-4px) rotate(0deg); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: var(--p-opacity, 0.08); }
          90% { opacity: var(--p-opacity, 0.08); }
          100% { transform: translateY(-120vh) translateX(40px); opacity: 0; }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes grainShift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-2px, -2px); }
        }
        @keyframes dashMove {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        onMouseMove={heroParallax}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#1a1a14',
        }}
      >
        {/* Background layers */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transform: `scale(1.15) translate(${(heroMouse.x - 0.5) * -16}px, ${(heroMouse.y - 0.5) * -16}px)`,
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }} />
        {/* Grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          animation: 'grainShift 8s steps(3) infinite',
          pointerEvents: 'none',
        }} />
        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(30,25,15,0.55) 0%, rgba(60,45,30,0.35) 50%, rgba(20,18,12,0.7) 100%)' }} />

        {/* Floating orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: '35vw', height: '35vw', maxWidth: '500px', maxHeight: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(218,165,32,0.1) 0%, transparent 65%)', animation: 'heroPulse 10s ease-in-out infinite', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '3%', width: '40vw', height: '40vw', maxWidth: '550px', maxHeight: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(90,114,71,0.1) 0%, transparent 65%)', animation: 'heroPulse 12s ease-in-out infinite 2s', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '40%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(135,206,235,0.07) 0%, transparent 70%)', animation: 'heroPulse 8s ease-in-out infinite 4s', zIndex: 0 }} />

        {/* Animated SVG weather line */}
        <svg style={{ position: 'absolute', bottom: '15%', left: '8%', width: '200px', height: '80px', zIndex: 0, opacity: 0.15 }} viewBox="0 0 300 100" fill="none" stroke="#87CEEB" strokeWidth="1">
          <path d="M0 60 Q75 10 150 50 Q225 90 300 40" strokeDasharray="1000" style={{ animation: 'dashMove 20s linear infinite' }} />
        </svg>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '0 24px', maxWidth: '960px' }}>
          {/* Animated title: each character independent */}
          <h1 style={{
            fontSize: 'clamp(56px, 11vw, 110px)',
            color: '#FAF8F5',
            marginBottom: '20px',
            lineHeight: 1.15,
            letterSpacing: '0.12em',
            fontFamily: 'var(--font-display)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.08em',
          }}>
            {titleChars.map((char, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  animation: `charFloat${i + 1} ${3.5 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  textShadow: '0 4px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05)',
                  filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.3))',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.15)'
                  e.currentTarget.style.color = '#DAA520'
                  e.currentTarget.style.textShadow = '0 8px 48px rgba(218,165,32,0.5), 0 2px 0 rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.color = ''
                  e.currentTarget.style.textShadow = '0 4px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                {char}
              </span>
            ))}
          </h1>

          {/* Subtitle with staggered reveal */}
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'rgba(250,248,245,0.75)',
            marginBottom: '56px',
            letterSpacing: '0.25em',
            fontWeight: 300,
            animation: 'slideUp 1s ease 0.3s both',
          }}>
            智慧农场 · 数字田园
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 1s ease 0.5s both' }}>
            <Link to="/farm" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '18px 44px',
              background: 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
              color: 'white', fontSize: '17px', fontWeight: 600,
              fontFamily: 'var(--font-body)', borderRadius: '14px',
              textDecoration: 'none',
              boxShadow: '0 8px 36px rgba(90,114,71,0.45)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(90,114,71,0.55)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 36px rgba(90,114,71,0.45)'
              }}
            >
              <span>进入仪表盘</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              {/* Shine effect */}
              <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', transition: 'left 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.left = '200%'}
              />
            </Link>
            <Link to="/assistant" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '18px 36px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500,
              fontFamily: 'var(--font-body)', borderRadius: '14px',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.4s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
                <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              </svg>
              AI 助手
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 3, color: 'rgba(250,248,245,0.5)', textAlign: 'center',
          animation: 'bounce 2.5s ease infinite',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.25em', marginBottom: '8px', textTransform: 'uppercase' }}>探索</div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ===== FEATURE CARDS SECTION ===== */}
      <section style={{ padding: '100px 32px', background: '#FAF8F5', position: 'relative' }}>
        <FloatingParticles />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#DAA520', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>
              Features
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)',
              color: '#3D3929', marginBottom: '16px', letterSpacing: '0.04em',
            }}>
              智慧农事工具集
            </h2>
            <p style={{ fontSize: '17px', color: '#8B7355', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
              从气象监测到 AI 诊断，覆盖农作物全生长周期的数字化管理
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
          }}>
            {features.map((item, i) => (
              <FeatureCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE DASHBOARD SECTION ===== */}
      <section style={{ padding: '80px 32px', background: '#F5F1E8', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#5A7247', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>
              Live Data
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 44px)', color: '#3D3929', marginBottom: '12px' }}>
              实时气象监测
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: '48px', height: '48px', margin: '0 auto 20px',
                border: '3px solid rgba(139,115,85,0.12)', borderTopColor: '#5A7247', borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ color: '#A69278', fontSize: '15px' }}>正在连接气象站...</p>
            </div>
          ) : (
            <>
              {dashboard?.alert && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.12) 0%, rgba(232,168,124,0.08) 100%)',
                  border: '1px solid rgba(218,165,32,0.25)', borderRadius: '18px',
                  padding: '18px 24px', marginBottom: '36px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(218,165,32,0.15)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    ⚠
                  </div>
                  <div>
                    <strong style={{ color: '#5D4E37', fontSize: '15px' }}>气象预警</strong>
                    <p style={{ color: '#8B7355', marginTop: '3px', fontSize: '13.5px' }}>{dashboard.alert}</p>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Weather Card */}
                <div style={{ background: '#fff', borderRadius: '22px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(93,78,55,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(135,206,235,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {iconSvgs.weather('#5A7247')}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#3D3929', fontSize: '15px' }}>实时天气</span>
                      <div style={{ fontSize: '11px', color: '#A69278' }}>Open-Meteo API</div>
                    </div>
                  </div>
                  {dashboard?.weather && (
                    <>
                      <div style={{ fontSize: '64px', fontWeight: 300, color: '#3D3929', lineHeight: 1, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                        <AnimatedCounter value={dashboard.weather.avg_temp} suffix="°C" />
                      </div>
                      <div style={{ color: '#8B7355', marginBottom: '24px', fontSize: '16px' }}>
                        {dashboard.weather.weather_desc || '天气晴好'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { l: '最高温', v: `${Math.round(dashboard.weather.temp_max)}°C`, c: '#E8A87C' },
                          { l: '最低温', v: `${Math.round(dashboard.weather.temp_min)}°C`, c: '#87CEEB' },
                          { l: '降水量', v: `${dashboard.weather.precipitation}mm`, c: '#5B7B8A' },
                          { l: '日照', v: `${dashboard.weather.sunshine_hours}h`, c: '#DAA520' },
                        ].map((item, i) => (
                          <div key={i} style={{ padding: '12px 14px', borderRadius: '12px', background: `${item.c}10` }}>
                            <div style={{ fontSize: '11px', color: '#A69278', marginBottom: '3px' }}>{item.l}</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: item.c }}>{item.v}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Sensor Card */}
                <div style={{ background: '#fff', borderRadius: '22px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(93,78,55,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(122,139,110,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {iconSvgs.sensor('#5A7247')}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#3D3929', fontSize: '15px' }}>环境传感器</span>
                      <div style={{ fontSize: '11px', color: '#A69278' }}>SENSOR-001</div>
                    </div>
                  </div>
                  {dashboard?.sensor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { l: '空气温度', v: `${dashboard.sensor.air_temperature}°C`, p: dashboard.sensor.air_temperature / 40 * 100 },
                        { l: '空气湿度', v: `${dashboard.sensor.air_humidity}%`, p: dashboard.sensor.air_humidity },
                        { l: '土壤湿度', v: `${dashboard.sensor.soil_moisture}%`, p: dashboard.sensor.soil_moisture },
                        { l: '光照强度', v: `${Math.round(dashboard.sensor.light_intensity)} lux`, p: Math.min(dashboard.sensor.light_intensity / 1000 * 100, 100) },
                        { l: 'CO₂浓度', v: `${dashboard.sensor.co2_concentration} ppm`, p: Math.min(dashboard.sensor.co2_concentration / 2000 * 100, 100) },
                        { l: '土壤pH', v: dashboard.sensor.soil_ph, p: (dashboard.sensor.soil_ph - 3) / 7 * 100 },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '12.5px', color: '#8B7355' }}>{item.l}</span>
                            <span style={{ fontWeight: 600, color: '#3D3929', fontSize: '13px' }}>{item.v}</span>
                          </div>
                          <div style={{ height: '5px', borderRadius: '3px', background: '#F0EDE5', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(item.p, 100)}%`, borderRadius: '3px', background: 'linear-gradient(90deg, #5A7247, #6B8E23)', transition: 'width 1.2s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#A69278', textAlign: 'center', padding: '48px 0', fontSize: '14px' }}>等待传感器数据...</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== QUICK ACCESS BAR ===== */}
      <section style={{ padding: '60px 32px', background: 'linear-gradient(135deg, #3D4A2E 0%, #4A5E35 50%, #3D4A2E 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)', marginBottom: '24px', textTransform: 'uppercase' }}>
            Quick Access
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { to: '/farm', label: '气象监测站', icon: 'weather' },
              { to: '/assistant', label: 'AI 助手', icon: 'chat' },
              { to: '/calendar', label: '生长日历', icon: 'calendar' },
              { to: '/fertilizer', label: '施肥计算', icon: 'fertilizer' },
              { to: '/disease', label: '病害识别', icon: 'disease' },
            ].map((item, i) => (
              <Link key={i} to={item.to} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 22px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px', color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-body)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {iconSvgs[item.icon] ? iconSvgs[item.icon]('rgba(255,255,255,0.7)') : null}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '40px 32px', background: '#1a1a14', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
          云上田园 · 数据来源 Open-Meteo · AI 驱动 智谱 GLM
        </div>
      </footer>
    </div>
  )
}
