import React from 'react'

const GRID_COLS = 3
const GRID_ROWS = 2
const TOTAL_PLOTS = GRID_COLS * GRID_ROWS

const CROP_CONFIG = {
  tomato: { name: '番茄', icon: '🍅', color: '#ff6b6b', bg: 'linear-gradient(135deg, #fff5f5, #ffe0e0)' },
  wheat: { name: '小麦', icon: '🌾', color: '#d4a017', bg: 'linear-gradient(135deg, #fffbe6, #f5e6b8)' },
  strawberry: { name: '草莓', icon: '🍓', color: '#ff4757', bg: 'linear-gradient(135deg, #fff0f3, #ffd6de)' },
  rice: { name: '水稻', icon: '🌾', color: '#4caf50', bg: 'linear-gradient(135deg, #f0fff4, #c8e6c9)' },
  corn: { name: '玉米', icon: '🌽', color: '#f9ca24', bg: 'linear-gradient(135deg, #fffdf0, #f5e6a3)' },
}

const STAGE_CONFIG = [
  { name: '播种期', icon: '🌰', color: '#8B4513' },
  { name: '发芽期', icon: '🌱', color: '#7ecf6a' },
  { name: '幼苗期', icon: '🌿', color: '#4caf50' },
  { name: '生长期', icon: '🌳', color: '#388e3c' },
  { name: '开花期', icon: '🌸', color: '#ff6b9d' },
  { name: '结果期', icon: '🍎', color: '#ff4444' },
  { name: '成熟期', icon: '🎉', color: '#ff9800' },
]

const GROWTH_PROGRESS = [0, 10, 25, 45, 60, 80, 100]

function PlotCard({ plot, onClick, isActivePlot }) {
  const isAdopted = plot.adopted
  const crop = plot.cropState
  const stageInfo = crop ? STAGE_CONFIG[crop.stage] || STAGE_CONFIG[0] : null
  const cropInfo = crop ? CROP_CONFIG[crop.cropType] : null
  const progress = crop ? GROWTH_PROGRESS[crop.stage] || 0 : 0

  return (
    <div
      onClick={() => onClick(plot)}
      style={{
        position: 'relative',
        borderRadius: 16,
        cursor: 'pointer',
        background: isAdopted ? (cropInfo?.bg || '#f0fdf0') : '#ffffff',
        border: isAdopted
          ? `2px solid ${cropInfo?.color || '#4caf50'}`
          : isActivePlot
            ? '2px solid #4caf50'
            : '2px dashed #d0d0d0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxShadow: isAdopted
          ? `0 4px 20px ${cropInfo?.color || '#4caf50'}22`
          : isActivePlot
            ? '0 4px 20px rgba(76,175,80,0.15)'
            : '0 2px 8px rgba(0,0,0,0.04)',
        minHeight: 180,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = isAdopted
          ? `0 8px 30px ${cropInfo?.color || '#4caf50'}33`
          : isActivePlot
            ? '0 8px 24px rgba(76,175,80,0.2)'
            : '0 8px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isAdopted
          ? `0 4px 20px ${cropInfo?.color || '#4caf50'}22`
          : isActivePlot
            ? '0 4px 20px rgba(76,175,80,0.15)'
            : '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      {isAdopted && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${cropInfo?.color || '#4caf50'}, ${cropInfo?.color || '#4caf50'}88)`,
        }} />
      )}

      <div style={{
        position: 'absolute',
        top: 10,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 8,
          background: isAdopted
            ? `linear-gradient(135deg, ${cropInfo?.color || '#4caf50'}, ${cropInfo?.color || '#4caf50'}bb)`
            : isActivePlot
              ? 'linear-gradient(135deg, #4caf50, #81c784)'
              : '#e8e8e8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: 'white',
        }}>
          {plot.num}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: isAdopted ? (cropInfo?.color || '#4caf50') : isActivePlot ? '#4caf50' : '#aaa',
          letterSpacing: '0.3px',
        }}>
          {isAdopted ? `${cropInfo?.name || '作物'}·${plot.num}号` : isActivePlot ? '我的地块' : `空闲地块`}
        </span>
      </div>

      {isAdopted ? (
        <>
          <div style={{
            marginTop: 8, fontSize: 48, lineHeight: 1,
            animation: 'bob 3s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
          }}>
            {cropInfo?.icon || '🌱'}
          </div>

          {stageInfo && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 8, fontSize: 13, fontWeight: 600,
              color: stageInfo.color,
            }}>
              <span>{stageInfo.icon}</span>
              <span>{stageInfo.name}</span>
            </div>
          )}

          <div style={{
            width: '70%', marginTop: 10,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
              <span>生长进度</span>
              <span style={{ fontWeight: 600, color: stageInfo?.color || '#4caf50' }}>{progress}%</span>
            </div>
            <div style={{
              height: 5, background: '#e8e8e8', borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: `linear-gradient(90deg, ${cropInfo?.color || '#4caf50'}88, ${cropInfo?.color || '#4caf50'})`,
                borderRadius: 3,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 10, left: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              flex: 1, height: 4, background: '#e8e8e8', borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${crop?.healthScore || 100}%`, height: '100%',
                background: (crop?.healthScore || 100) >= 80 ? '#4caf50'
                  : (crop?.healthScore || 100) >= 50 ? '#ff9800' : '#f44336',
                borderRadius: 2,
                transition: 'width 0.5s',
              }} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: (crop?.healthScore || 100) >= 80 ? '#4caf50'
                : (crop?.healthScore || 100) >= 50 ? '#ff9800' : '#f44336',
              minWidth: 28, textAlign: 'right',
            }}>
              {Math.round(crop?.healthScore || 100)}
            </span>
          </div>

          <div style={{
            position: 'absolute', bottom: 22, right: 12,
            fontSize: 10, color: '#aaa', fontWeight: 500,
          }}>
            第{crop?.dayNumber || 1}天
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#f0f0f0', border: '2px dashed #d0d0d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#bbb',
          }}>
            ➕
          </div>
          <div style={{
            fontSize: 13, color: '#bbb', marginTop: 8, fontWeight: 500,
            letterSpacing: '0.5px',
          }}>
            {isActivePlot ? '点击开始种植' : '空闲地块'}
          </div>
        </>
      )}
    </div>
  )
}

export default function FarmScene({
  weatherEffect = 'clear',
  activePlotNum,
  cropState,
  onPlotClick,
  selectedPlot,
}) {
  const plots = []
  for (let i = 0; i < TOTAL_PLOTS; i++) {
    const num = i + 1
    const isActive = activePlotNum === num
    plots.push({
      num,
      adopted: isActive,
      cropState: isActive && cropState?.dayNumber > 1 ? {
        cropType: cropState.cropType,
        stage: cropState.stage,
        stageName: cropState.stageName,
        healthScore: cropState.healthScore,
        height: cropState.height,
        dayNumber: cropState.dayNumber,
      } : null,
      status: isActive ? (cropState?.dayNumber > 1 ? 'adopted' : 'ready') : 'available',
    })
  }

  const weatherBg = weatherEffect === 'rainy'
    ? 'linear-gradient(180deg, #d4e8f0 0%, #e8f4f8 50%, #f0f8fa 100%)'
    : weatherEffect === 'cloudy'
      ? 'linear-gradient(180deg, #e8edf2 0%, #f0f4f8 50%, #f5f7fa 100%)'
      : 'linear-gradient(180deg, #f5faf5 0%, #fafffa 50%, #ffffff 100%)'

  const activeCount = activePlotNum && cropState?.dayNumber > 1 ? 1 : 0

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: weatherBg,
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.8s ease',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: weatherEffect === 'rainy'
          ? 'radial-gradient(ellipse at 20% 50%, rgba(100,150,180,0.08) 0%, transparent 70%)'
          : weatherEffect === 'clear'
            ? 'radial-gradient(ellipse at 80% 20%, rgba(255,200,50,0.06) 0%, transparent 60%)'
            : 'none',
      }} />

      <div style={{
        padding: '20px 24px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 2px 8px rgba(76,175,80,0.3)',
          }}>
            🏡
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1b5e20' }}>智慧农场</span>
            <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>
              {GRID_COLS}×{GRID_ROWS} 地块
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 20,
          fontSize: 13, fontWeight: 600,
          background: weatherEffect === 'rainy' ? '#e3f2fd' :
            weatherEffect === 'cloudy' ? '#fff3e0' : '#e8f5e9',
          color: weatherEffect === 'rainy' ? '#1565c0' :
            weatherEffect === 'cloudy' ? '#e65100' : '#2e7d32',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span>
            {weatherEffect === 'rainy' ? '🌧️' : weatherEffect === 'cloudy' ? '☁️' : '☀️'}
          </span>
          {weatherEffect === 'rainy' ? '雨天' : weatherEffect === 'cloudy' ? '多云' : '晴天'}
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '12px 24px 16px',
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gap: 16,
        position: 'relative',
        zIndex: 1,
        alignContent: 'center',
      }}>
        {plots.map((plot) => (
          <PlotCard
            key={plot.num}
            plot={plot}
            onClick={() => onPlotClick(plot)}
            isActivePlot={activePlotNum === plot.num && !plot.adopted}
          />
        ))}
      </div>

      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        display: 'flex', gap: 20, fontSize: 12, color: '#999',
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
          种植中 {activeCount} 块
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d0d0d0', display: 'inline-block' }} />
          空闲 {TOTAL_PLOTS - activeCount} 块
        </span>
        {cropState?.dayNumber > 1 && (
          <span style={{ marginLeft: 'auto', fontWeight: 500, color: '#666' }}>
            📅 生长第 {cropState.dayNumber} 天
          </span>
        )}
      </div>
    </div>
  )
}