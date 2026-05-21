import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ImageUploader from '../components/ImageUploader'
import ResultCard from '../components/ResultCard'

const API_BASE = '/api'
const STORAGE_KEY = 'cloud_farm_disease_last_crop'

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

const SELECT_STYLE = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d0cfc7',
  backgroundColor: '#fff',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: '#3d3929',
  cursor: 'pointer',
  outline: 'none',
  minWidth: '200px',
}

const CROP_OPTIONS = [
  { key: '', name: '不指定（自动识别）', icon: '🔍' },
  { key: '水稻', name: '水稻', icon: '🌾' },
  { key: '小麦', name: '小麦', icon: '🌿' },
  { key: '玉米', name: '玉米', icon: '🌽' },
  { key: '番茄', name: '番茄', icon: '🍅' },
  { key: '黄瓜', name: '黄瓜', icon: '🥒' },
  { key: '棉花', name: '棉花', icon: '☁' },
  { key: '草莓', name: '草莓', icon: '🍓' },
  { key: '十字花科', name: '十字花科蔬菜', icon: '🥬' },
]

export default function DiseaseIdentifierPage() {
  const [cropType, setCropType] = useState('')
  const [imageBase64, setImageBase64] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState(null)
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setCropType(saved)
  }, [])

  const handleImageReady = (base64, filename) => {
    setImageBase64(base64)
    setImageFileName(filename)
    setResult(null)
    setError('')
    setSavedId(null)
    setFeedbackSent(false)
  }

  const handleRecognize = async () => {
    if (!imageBase64) {
      setError('请先上传或拍摄图片')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/disease/recognize`, {
        image: imageBase64,
        crop_type: cropType,
      })
      if (res.data.success) {
        setResult(res.data.data)
        if (cropType) localStorage.setItem(STORAGE_KEY, cropType)
      }
    } catch (e) {
      setError(e.response?.data?.detail || '识别失败，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    try {
      const res = await axios.post(`${API_BASE}/disease/save`, {
        crop_type: cropType,
        disease_name: result.disease_name,
        confidence: result.confidence,
        recommendation: result.recommendation,
        description: result.description,
        filename: result.filename,
      })
      if (res.data.success) {
        setSavedId(res.data.data.id)
      }
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  const handleFeedback = async (isCorrect) => {
    if (!savedId || feedbackSent) return
    try {
      await axios.post(`${API_BASE}/disease/feedback`, {
        id: savedId,
        is_correct: isCorrect,
      })
      setFeedbackSent(true)
    } catch (e) {
      console.error('Feedback failed:', e)
    }
  }

  return (
    <div style={PAGE_STYLE}>
      <style>{`
        @keyframes diseaseFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div style={HERO_STYLE}>
        <div style={{ marginBottom: '8px', animation: 'diseaseFloat 5s ease-in-out infinite' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#5A7247" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <path d="M8 11h6"/>
            <path d="M11 8v6"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#3d3929', margin: '0 0 8px' }}>
          病虫害图像识别
        </h1>
        <p style={{ fontSize: '15px', color: '#8B7355', margin: 0, lineHeight: '1.6' }}>
          上传作物图片，AI 自动识别病虫害并给出防治方案
        </p>
      </div>

      {/* Upload Panel */}
      <div style={PANEL_STYLE}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600 }}>🌱 作物类型（可选）</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              style={SELECT_STYLE}
            >
              {CROP_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ImageUploader onImageReady={handleImageReady} disabled={loading} />

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleRecognize}
            disabled={loading || !imageBase64}
            style={{
              padding: '12px 48px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: loading || !imageBase64 ? '#A69278' : '#5A7247',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading || !imageBase64 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => { if (!loading && imageBase64) e.currentTarget.style.backgroundColor = '#4A6037' }}
            onMouseLeave={(e) => { if (!loading && imageBase64) e.currentTarget.style.backgroundColor = '#5A7247' }}
          >
            {loading ? '⏳ 识别中...' : '🔍 开始识别'}
          </button>
        </div>
      </div>

      {/* Loading Progress */}
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
          <div style={{ color: '#8B7355', fontSize: '15px', marginBottom: '12px' }}>
            AI 正在分析图片...
          </div>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <div style={{
              height: '4px',
              backgroundColor: '#E8E4D9',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: '60%',
                backgroundColor: '#5A7247',
                borderRadius: '2px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { width: 30%; }
              50% { width: 85%; }
            }
          `}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#FFF0F0', borderRadius: '8px', color: '#C75050', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <>
          <ResultCard result={result} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleSave}
              disabled={!!savedId}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #DAA520',
                backgroundColor: savedId ? '#FFF8E8' : '#fff',
                color: savedId ? '#B8860B' : '#DAA520',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: savedId ? 'default' : 'pointer',
              }}
            >
              {savedId ? '✓ 已保存' : '💾 保存记录'}
            </button>

            {savedId && !feedbackSent && (
              <>
                <button
                  onClick={() => handleFeedback(true)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: '1px solid #5A7247',
                    backgroundColor: '#fff',
                    color: '#5A7247',
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  ✓ 识别正确
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: '1px solid #C75050',
                    backgroundColor: '#fff',
                    color: '#C75050',
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  ✗ 识别有误
                </button>
              </>
            )}

            {feedbackSent && (
              <span style={{ fontSize: '14px', color: '#8B7355', padding: '10px 0' }}>
                感谢反馈！这将帮助我们提高识别准确率
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
