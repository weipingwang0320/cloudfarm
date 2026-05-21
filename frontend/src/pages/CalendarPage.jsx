import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CascadeSelector from '../components/CascadeSelector'
import TimelineView from '../components/TimelineView'
import CalendarExport from '../components/CalendarExport'

const API_BASE = '/api'
const FAVORITES_KEY = 'cloud_farm_calendar_favorites'

const PAGE_STYLE = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '32px 20px 60px',
}

const HERO_STYLE = {
  textAlign: 'center',
  marginBottom: '36px',
}

const PANEL_STYLE = {
  backgroundColor: '#fff',
  borderRadius: '14px',
  padding: '28px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  marginBottom: '24px',
}

const INPUT_STYLE = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d0cfc7',
  backgroundColor: '#fff',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: '#3d3929',
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

export default function CalendarPage() {
  const [crops, setCrops] = useState([])
  const [provinces, setProvinces] = useState([])
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [sowingDate, setSowingDate] = useState('')
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInitData()
  }, [])

  const fetchInitData = async () => {
    try {
      const [cropsRes, provincesRes] = await Promise.all([
        axios.get(`${API_BASE}/calendar/crops`),
        axios.get(`${API_BASE}/calendar/provinces`),
      ])
      if (cropsRes.data.success) setCrops(cropsRes.data.data)
      if (provincesRes.data.success) setProvinces(provincesRes.data.data)
    } catch (e) {
      console.error('Failed to load initial data:', e)
    }
  }

  const handleGenerate = async () => {
    if (!selectedCrop || !selectedProvince || !selectedZone || !sowingDate) {
      setError('请完整选择作物、省份、气候区和播种日期')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/calendar/generate`, {
        params: {
          crop: selectedCrop,
          province: selectedProvince,
          zone: selectedZone,
          sowing_date: sowingDate,
        },
      })
      if (res.data.success) {
        setTimeline(res.data.data)
      }
    } catch (e) {
      setError(e.response?.data?.detail || '生成失败，请检查参数后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFavorite = () => {
    if (!timeline) return
    const entry = {
      id: Date.now(),
      crop: selectedCrop,
      province: selectedProvince,
      zone: selectedZone,
      sowingDate,
      cropName: timeline.crop_name,
      zoneName: timeline.zone_name,
      harvestDate: timeline.harvest_date,
      totalDays: timeline.total_days,
      savedAt: new Date().toISOString(),
    }
    const updated = [entry, ...favorites].slice(0, 20)
    setFavorites(updated)
    saveFavorites(updated)
  }

  const handleLoadFavorite = (fav) => {
    setSelectedCrop(fav.crop)
    setSelectedProvince(fav.province)
    setSelectedZone(fav.zone)
    setSowingDate(fav.sowingDate)
    setTimeline(null)
  }

  const handleDeleteFavorite = (id) => {
    const updated = favorites.filter((f) => f.id !== id)
    setFavorites(updated)
    saveFavorites(updated)
  }

  const selectedCropInfo = crops.find((c) => c.key === selectedCrop)

  return (
    <div style={PAGE_STYLE}>
      {/* Decorative floating elements */}
      <style>{`
        @keyframes calFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>

      <div style={HERO_STYLE}>
        <div style={{ marginBottom: '8px', animation: 'calFloat 6s ease-in-out infinite' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#5A7247" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4"/>
            <path d="M8 2v4"/>
            <path d="M3 10h18"/>
            <path d="M10 14v4"/>
            <path d="M14 10c0 3-4 4-4 8"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#3d3929', margin: '0 0 8px' }}>
          作物生长日历生成器
        </h1>
        <p style={{ fontSize: '15px', color: '#8B7355', margin: 0, lineHeight: '1.6' }}>
          选择作物与地区，自动生成关键农事节点时间轴
        </p>
      </div>

      {/* Selection Panel */}
      <div style={PANEL_STYLE}>
        <CascadeSelector
          crops={crops}
          provinces={provinces}
          selectedCrop={selectedCrop}
          selectedProvince={selectedProvince}
          selectedZone={selectedZone}
          onCropChange={(v) => { setSelectedCrop(v); setTimeline(null); setError('') }}
          onProvinceChange={(v) => { setSelectedProvince(v); setTimeline(null) }}
          onZoneChange={(v) => { setSelectedZone(v); setTimeline(null) }}
        />

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600 }}>📅 播种日期</label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => { setSowingDate(e.target.value); setTimeline(null); setError('') }}
              style={INPUT_STYLE}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '11px 32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading ? '#A69278' : '#5A7247',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#4A6037' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#5A7247' }}
          >
            {loading ? '⏳ 生成中...' : '✨ 生成日历'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#FFF0F0', borderRadius: '8px', color: '#C75050', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {timeline && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#8B7355' }}>
              🌡 {timeline.zone_name} · {timeline.zone_adjustment} 调整
            </span>
            {timeline.frost_free && (
              <span style={{ fontSize: '13px', color: '#8B7355' }}>
                ❄ 无霜期：{timeline.frost_free.start} ~ {timeline.frost_free.end}
              </span>
            )}
            <span style={{ fontSize: '13px', color: '#8B7355' }}>
              📐 总生育期：{timeline.total_days}天
            </span>
          </div>
        )}
      </div>

      {/* Timeline Result */}
      {timeline && (
        <div style={PANEL_STYLE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3d3929', margin: 0 }}>
              生长时间轴
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveFavorite}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #DAA520',
                  backgroundColor: '#fff',
                  color: '#DAA520',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                ⭐ 收藏此日历
              </button>
              <CalendarExport
                timeline={timeline.timeline}
                cropName={timeline.crop_name}
                cropIcon={timeline.crop_icon}
                sowingDate={timeline.sowing_date}
              />
            </div>
          </div>

          <TimelineView
            timeline={timeline.timeline}
            cropName={timeline.crop_name}
            cropIcon={timeline.crop_icon}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #E8E4D9',
            borderTopColor: '#5A7247',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <span style={{ color: '#8B7355', fontSize: '15px' }}>正在生成生长日历...</span>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div style={PANEL_STYLE}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3d3929', margin: '0 0 16px' }}>
            ⭐ 我的收藏
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {favorites.map((fav) => (
              <div
                key={fav.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF8F5',
                  border: '1px solid #E8E4D9',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
                onClick={() => handleLoadFavorite(fav)}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#3d3929', fontSize: '15px' }}>
                    {fav.cropName} · {fav.province}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8B7355', marginTop: '2px' }}>
                    {fav.zoneName} · 播种：{fav.sowingDate} · 收获：{fav.harvestDate} · {fav.totalDays}天
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteFavorite(fav.id) }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#C75050',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
