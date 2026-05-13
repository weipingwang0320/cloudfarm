import React from 'react'

const GRID_COLS = 3
const GRID_ROWS = 2
const TOTAL_PLOTS = GRID_COLS * GRID_ROWS

const CROP_CONFIG = {
  tomato: { name: '番茄', icon: '🍅', color: '#C75050', bg: 'linear-gradient(135deg, rgba(199,80,80,0.08) 0%, rgba(199,80,80,0.03) 100%)' },
  strawberry: { name: '草莓', icon: '🍓', color: '#E85A5A', bg: 'linear-gradient(135deg, rgba(232,90,90,0.08) 0%, rgba(232,90,90,0.03) 100%)' },
  corn: { name: '玉米', icon: '🌽', color: '#DAA520', bg: 'linear-gradient(135deg, rgba(218,165,32,0.08) 0%, rgba(218,165,32,0.03) 100%)' },
  rice: { name: '水稻', icon: '🌾', color: '#5A7247', bg: 'linear-gradient(135deg, rgba(90,114,71,0.08) 0%, rgba(90,114,71,0.03) 100%)' },
}

const STAGE_CONFIG = [
  { name: '播种期', color: '#8B7355' },
  { name: '发芽期', color: '#7A8B6E' },
  { name: '幼苗期', color: '#6B8E23' },
  { name: '生长期', color: '#5A7247' },
  { name: '开花期', color: '#E8A87C' },
  { name: '结果期', color: '#C75050' },
  { name: '成熟期', color: '#DAA520' },
]

const GROWTH_PROGRESS = [0, 10, 25, 45, 60, 80, 100]

// 农场背景图片
const FARM_BG = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80'

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
        borderRadius: '20px',
        cursor: 'pointer',
        background: isAdopted ? (cropInfo?.bg || 'var(--paper-cream)') : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        border: isAdopted
          ? `2px solid ${cropInfo?.color || 'var(--primary)'}`
          : isActivePlot
            ? '2px solid var(--primary)'
            : '2px dashed rgba(139,115,85,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxShadow: isAdopted
          ? `0 8px 32px ${cropInfo?.color || 'var(--primary)'}15`
          : isActivePlot
            ? '0 8px 32px rgba(90,114,71,0.15)'
            : '0 4px 16px rgba(0,0,0,0.04)',
        minHeight: '200px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.boxShadow = isAdopted
          ? `0 16px 48px ${cropInfo?.color || 'var(--primary)'}25`
          : '0 16px 48px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isAdopted
          ? `0 8px 32px ${cropInfo?.color || 'var(--primary)'}15`
          : isActivePlot
            ? '0 8px 32px rgba(90,114,71,0.15)'
            : '0 4px 16px rgba(0,0,0,0.04)'
      }}
    >
      {isAdopted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${cropInfo?.color || 'var(--primary)'}, ${cropInfo?.color || 'var(--primary)'}88)`,
        }} />
      )}

      {/* 地块编号 */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '10px',
          background: isAdopted
            ? `linear-gradient(135deg, ${cropInfo?.color || 'var(--primary)'}, ${cropInfo?.color || 'var(--primary)'}cc)`
            : isActivePlot
              ? 'linear-gradient(135deg, var(--primary), var(--leaf-green))'
              : 'var(--paper-cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: '700',
          color: isAdopted || isActivePlot ? 'white' : 'var(--text-muted)',
        }}>
          {plot.num}
        </div>
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: isAdopted ? (cropInfo?.color || 'var(--primary)') : isActivePlot ? 'var(--primary)' : 'var(--text-muted)',
        }}>
          {isAdopted ? `${cropInfo?.name || '作物'}` : isActivePlot ? '我的地块' : '空闲'}
        </span>
      </div>

      {isAdopted ? (
        <>
          {/* 作物图标 */}
          <div style={{
            marginTop: '20px',
            fontSize: '56px',
            lineHeight: 1,
            animation: 'bob 4s ease-in-out infinite',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          }}>
            {cropInfo?.icon || '🌱'}
          </div>

          {/* 生长阶段 */}
          {stageInfo && (
            <div style={{
              marginTop: '12px',
              padding: '6px 16px',
              background: `${stageInfo.color}15`,
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: stageInfo.color,
            }}>
              {stageInfo.name}
            </div>
          )}

          {/* 生长进度 */}
          <div style={{
            width: '82%',
            marginTop: '14px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>生长进度</span>
                <span style={{
                  fontSize: '11px',
                  color: stageInfo?.color || 'var(--primary)',
                  background: `${stageInfo?.color || 'var(--primary)'}12`,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: '600',
                }}>
                  {(crop?.stage ?? 0) + 1}/7
                </span>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: stageInfo?.color || 'var(--primary)',
              }}>
                {progress}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: '8px', borderRadius: '5px' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: '5px',
                  background: `linear-gradient(90deg, ${cropInfo?.color || 'var(--primary)'}66, ${cropInfo?.color || 'var(--primary)'})`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* 生长天数 */}
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: '500',
            }}>
              第 {crop?.dayNumber || 1} 天
            </span>
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isActivePlot ? 'var(--paper-cream)' : 'rgba(139,115,85,0.05)',
            border: `2px dashed ${isActivePlot ? 'var(--primary)' : 'rgba(139,115,85,0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isActivePlot ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div style={{
            fontSize: '14px',
            color: isActivePlot ? 'var(--primary)' : 'var(--text-muted)',
            marginTop: '12px',
            fontWeight: '500',
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
        height: cropState.height,
        dayNumber: cropState.dayNumber,
      } : null,
      status: isActive ? (cropState?.dayNumber > 1 ? 'adopted' : 'ready') : 'available',
    })
  }

  const activeCount = activePlotNum && cropState?.dayNumber > 1 ? 1 : 0

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景图片 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${FARM_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.95)',
      }} />

      {/* 天气效果层 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: weatherEffect === 'rainy'
          ? 'linear-gradient(180deg, rgba(100,130,150,0.15) 0%, rgba(80,110,130,0.1) 100%)'
          : weatherEffect === 'cloudy'
            ? 'linear-gradient(180deg, rgba(180,180,180,0.1) 0%, rgba(150,150,150,0.05) 100%)'
            : 'linear-gradient(180deg, rgba(255,220,150,0.1) 0%, transparent 50%)',
        transition: 'background 0.8s ease',
      }} />

      {/* 内容层 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}>
        {/* 顶部状态栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--earth-dark)' }}>
                我的农场
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {GRID_COLS} × {GRID_ROWS} 地块布局
              </div>
            </div>
          </div>

          {/* 天气状态 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-soft)',
          }}>
            <span style={{ fontSize: '20px' }}>
              {weatherEffect === 'rainy' ? '🌧' : weatherEffect === 'cloudy' ? '☁' : '☀'}
            </span>
            <span style={{
              fontWeight: '600',
              fontSize: '15px',
              color: 'var(--earth-dark)',
            }}>
              {weatherEffect === 'rainy' ? '雨天' : weatherEffect === 'cloudy' ? '多云' : '晴天'}
            </span>
          </div>
        </div>

        {/* 地块网格 */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gap: '20px',
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

        {/* 底部统计 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          marginTop: '20px',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--primary)',
            }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              种植中 <strong style={{ color: 'var(--earth-dark)' }}>{activeCount}</strong> 块
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--border-light)',
            }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              空闲 <strong style={{ color: 'var(--earth-dark)' }}>{TOTAL_PLOTS - activeCount}</strong> 块
            </span>
          </div>
          {cropState?.dayNumber > 1 && (
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'var(--paper-cream)',
              borderRadius: '12px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--earth-dark)' }}>
                生长第 {cropState.dayNumber} 天
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 动画 */}
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
