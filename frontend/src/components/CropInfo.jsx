import React from 'react'

const CROP_ICONS = {
  tomato: '🍅',
  wheat: '🌾',
  strawberry: '🍓',
  rice: '🌾',
  corn: '🌽',
}

const STAGE_ICONS = ['🌰', '🌱', '🌿', '🌳', '🌸', '🍎', '🎉']

export default function CropInfo({ cropState }) {
  if (!cropState || cropState.dayNumber < 1) return null

  const cropIcon = CROP_ICONS[cropState.cropType] || '🌱'
  const stageIcon = STAGE_ICONS[cropState.stage] || '🌱'
  const healthColor = cropState.healthScore >= 80 ? 'var(--primary)' : cropState.healthScore >= 50 ? '#ff9800' : '#f44336'

  return (
    <div className="card" style={{
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      minWidth: 180,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{cropIcon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{cropState.cropType === 'tomato' ? '番茄' :
            cropState.cropType === 'wheat' ? '小麦' :
            cropState.cropType === 'strawberry' ? '草莓' :
            cropState.cropType === 'rice' ? '水稻' :
            cropState.cropType === 'corn' ? '玉米' : '作物'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>第 {cropState.dayNumber} 天</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>{stageIcon}</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{cropState.stageName}</span>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
          <span style={{ color: 'var(--text-light)' }}>健康度</span>
          <span style={{ fontWeight: 600, color: healthColor }}>{cropState.healthScore}%</span>
        </div>
        <div className="progress-bar" style={{ height: 5 }}>
          <div className="progress-fill" style={{
            width: `${cropState.healthScore}%`,
            background: healthColor,
          }} />
        </div>
      </div>

      {cropState.height > 0 && (
        <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-light)' }}>📏 株高</span>
          <span style={{ fontWeight: 600 }}>{cropState.height} cm</span>
        </div>
      )}

      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-light)' }}>📊 积温</span>
        <span style={{ fontWeight: 600 }}>{cropState.accumulatedGdd?.toFixed(0) || 0} °C·d</span>
      </div>
    </div>
  )
}