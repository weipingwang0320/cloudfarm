import React, { useState, useEffect } from 'react'
import axios from 'axios'
import SliderInput from '../components/SliderInput'
import ResultTable from '../components/ResultTable'

const API_BASE = '/api'
const STORAGE_KEY = 'cloud_farm_fertilizer_last_input'

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
  minWidth: '220px',
}

const DEFAULT_SOIL = { n: 80, p: 15, k: 120, om: 2.0, ph: 6.5 }

function loadLastInput() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function saveLastInput(input) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
}

export default function FertilizerCalculatorPage() {
  const [crops, setCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState('')
  const [targetYield, setTargetYield] = useState(6000)
  const [soilN, setSoilN] = useState(DEFAULT_SOIL.n)
  const [soilP, setSoilP] = useState(DEFAULT_SOIL.p)
  const [soilK, setSoilK] = useState(DEFAULT_SOIL.k)
  const [soilOM, setSoilOM] = useState(DEFAULT_SOIL.om)
  const [soilPH, setSoilPH] = useState(DEFAULT_SOIL.ph)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState(null)

  useEffect(() => {
    fetchCrops()
    const saved = loadLastInput()
    if (saved) {
      if (saved.crop) setSelectedCrop(saved.crop)
      if (saved.targetYield) setTargetYield(saved.targetYield)
      if (saved.soilN) setSoilN(saved.soilN)
      if (saved.soilP) setSoilP(saved.soilP)
      if (saved.soilK) setSoilK(saved.soilK)
      if (saved.soilOM) setSoilOM(saved.soilOM)
      if (saved.soilPH) setSoilPH(saved.soilPH)
    }
  }, [])

  const fetchCrops = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fertilizer/crops`)
      if (res.data.success) setCrops(res.data.data)
    } catch (e) {
      console.error('Failed to load crops:', e)
    }
  }

  const selectedCropData = crops.find((c) => c.key === selectedCrop)

  const handleCropChange = (key) => {
    setSelectedCrop(key)
    setResult(null)
    setError('')
    setSavedId(null)
    const crop = crops.find((c) => c.key === key)
    if (crop) {
      const mid = Math.round((crop.target_yield.min + crop.target_yield.max) / 2 / crop.target_yield.step) * crop.target_yield.step
      setTargetYield(mid)
    }
  }

  const handleCalculate = async () => {
    if (!selectedCrop) {
      setError('请选择作物类型')
      return
    }
    setError('')
    setSavedId(null)
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/fertilizer/calculate`, {
        params: {
          crop: selectedCrop,
          target_yield: targetYield,
          soil_n: soilN,
          soil_p: soilP,
          soil_k: soilK,
          soil_om: soilOM,
          soil_ph: soilPH,
        },
      })
      if (res.data.success) {
        setResult(res.data.data)
        saveLastInput({
          crop: selectedCrop,
          targetYield,
          soilN,
          soilP,
          soilK,
          soilOM,
          soilPH,
        })
      }
    } catch (e) {
      if (e.response?.status === 429) {
        setError('请求过于频繁，请稍后再试（每分钟限10次）')
      } else {
        setError(e.response?.data?.detail || '计算失败，请检查参数')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHistory = async () => {
    if (!result) return
    try {
      const res = await axios.post(`${API_BASE}/fertilizer/history`, {
        crop_key: selectedCrop,
        crop_name: result.crop_name,
        target_yield: targetYield,
        soil_n: soilN,
        soil_p: soilP,
        soil_k: soilK,
        soil_om: soilOM,
        soil_ph: soilPH,
        result,
      })
      if (res.data.success) {
        setSavedId(res.data.data.id)
      }
    } catch (e) {
      console.error('Failed to save history:', e)
    }
  }

  const handleExportCSV = () => {
    if (!result) return
    const { nutrients, products, micronutrient, crop_name, input } = result
    const bom = '﻿'
    const rows = [
      ['项目', '数值', '单位'],
      ['作物', crop_name, ''],
      ['目标产量', input.target_yield, input.yield_unit],
      ['土壤速效N', input.soil_n, 'mg/kg'],
      ['土壤速效P', input.soil_p, 'mg/kg'],
      ['土壤速效K', input.soil_k, 'mg/kg'],
      ['土壤有机质', input.soil_om, '%'],
      ['土壤pH', input.soil_ph, ''],
      ['', '', ''],
      ['--- 纯养分 ---', '', ''],
      ['氮 (N)', nutrients.N, 'kg/ha'],
      ['磷 (P₂O₅)', nutrients.P2O5, 'kg/ha'],
      ['钾 (K₂O)', nutrients.K2O, 'kg/ha'],
      ['', '', ''],
      ['--- 商品肥料 ---', '', ''],
      ['尿素 (46%N)', products.urea, 'kg/ha'],
      ['磷酸二铵 DAP', products.dap, 'kg/ha'],
      ['氯化钾 MOP', products.mop, 'kg/ha'],
    ]
    if (micronutrient.ZnSO4 > 0) rows.push(['硫酸锌 ZnSO₄', micronutrient.ZnSO4, 'kg/ha'])
    if (micronutrient.Borax > 0) rows.push(['硼砂 Borax', micronutrient.Borax, 'kg/ha'])

    const csv = bom + rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${crop_name}_施肥方案_${new Date().toLocaleDateString('zh-CN')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const yieldRange = selectedCropData?.target_yield || { min: 0, max: 10000, step: 100, unit: 'kg/ha' }

  return (
    <div style={PAGE_STYLE}>
      <style>{`
        @keyframes fertFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      <div style={HERO_STYLE}>
        <div style={{ marginBottom: '8px', animation: 'fertFloat 5s ease-in-out infinite' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#5A7247" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
            <path d="M9 3h6v4l3 6v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6l3-6V3z"/>
            <path d="M9 8h6"/>
            <path d="M12 12v4"/>
            <circle cx="9" cy="17" r="1"/>
            <circle cx="15" cy="17" r="1"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#3d3929', margin: '0 0 8px' }}>
          施肥量精准计算器
        </h1>
        <p style={{ fontSize: '15px', color: '#8B7355', margin: 0, lineHeight: '1.6' }}>
          基于目标产量法，输入土壤肥力参数，精准计算 N/P/K 及微量元素用量
        </p>
      </div>

      {/* Selection Panel */}
      <div style={PANEL_STYLE}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600 }}>🌱 选择作物</label>
          <select
            value={selectedCrop}
            onChange={(e) => handleCropChange(e.target.value)}
            style={SELECT_STYLE}
          >
            <option value="">-- 请选择作物 --</option>
            {crops.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.name}（{c.target_yield.min}-{c.target_yield.max} {c.target_yield.unit}）
              </option>
            ))}
          </select>
        </div>

        <SliderInput
          label="目标产量"
          unit={yieldRange.unit}
          min={yieldRange.min}
          max={yieldRange.max}
          step={yieldRange.step}
          value={targetYield}
          onChange={(v) => { setTargetYield(v); setResult(null) }}
          icon="🎯"
        />
      </div>

      {/* Soil Parameters */}
      <div style={PANEL_STYLE}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#3d3929', margin: '0 0 ' + '18px' }}>
          🧪 土壤基础肥力
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <SliderInput label="速效氮" unit="mg/kg" min={0} max={300} step={1} value={soilN} onChange={(v) => { setSoilN(v); setResult(null) }} icon="🔵" />
          <SliderInput label="速效磷" unit="mg/kg" min={0} max={100} step={0.1} value={soilP} onChange={(v) => { setSoilP(v); setResult(null) }} icon="🟡" />
          <SliderInput label="速效钾" unit="mg/kg" min={0} max={400} step={1} value={soilK} onChange={(v) => { setSoilK(v); setResult(null) }} icon="🟠" />
          <SliderInput label="有机质" unit="%" min={0} max={10} step={0.1} value={soilOM} onChange={(v) => { setSoilOM(v); setResult(null) }} icon="🟤" />
          <SliderInput label="土壤pH" unit="" min={3.5} max={9.0} step={0.1} value={soilPH} onChange={(v) => { setSoilPH(v); setResult(null) }} icon="⚗" />
        </div>
      </div>

      {/* Calculate Button */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <button
          onClick={handleCalculate}
          disabled={loading || !selectedCrop}
          style={{
            padding: '12px 48px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: loading || !selectedCrop ? '#A69278' : '#5A7247',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: loading || !selectedCrop ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => { if (!loading && selectedCrop) e.currentTarget.style.backgroundColor = '#4A6037' }}
          onMouseLeave={(e) => { if (!loading && selectedCrop) e.currentTarget.style.backgroundColor = '#5A7247' }}
        >
          {loading ? '⏳ 计算中...' : '🔬 计算施肥量'}
        </button>
      </div>

      {/* Loading */}
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
          <span style={{ color: '#8B7355', fontSize: '15px' }}>正在计算施肥方案...</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#8B7355' }}>
              {result.crop_icon} {result.crop_name} · 目标产量 {result.input.target_yield} {result.input.yield_unit}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveHistory}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #DAA520',
                  backgroundColor: savedId ? '#FFF8E8' : '#fff',
                  color: '#DAA520',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {savedId ? '✓ 已保存' : '💾 保存记录'}
              </button>
              <button
                onClick={handleExportCSV}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#5A7247',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4A6037')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5A7247')}
              >
                📥 导出CSV
              </button>
            </div>
          </div>
          <ResultTable result={result} />
        </>
      )}
    </div>
  )
}
