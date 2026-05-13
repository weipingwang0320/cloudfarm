import React from 'react'

const CROP_CONFIG = {
  tomato: { name: '番茄', icon: '🍅', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', color: '#C75050' },
  strawberry: { name: '草莓', icon: '🍓', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&q=80', color: '#E85A5A' },
  corn: { name: '玉米', icon: '🌽', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80', color: '#DAA520' },
  rice: { name: '水稻', icon: '🌾', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&q=80', color: '#5A7247' },
}

const STAGE_CONFIG = [
  { name: '播种期', desc: '种子被埋入温暖的土壤中', color: '#8B7355' },
  { name: '发芽期', desc: '种子开始萌发，破土而出', color: '#7A8B6E' },
  { name: '幼苗期', desc: '幼苗茁壮成长，展开新叶', color: '#6B8E23' },
  { name: '生长期', desc: '快速生长，枝叶繁茂', color: '#5A7247' },
  { name: '开花期', desc: '花朵绽放，迎接授粉', color: '#E8A87C' },
  { name: '结果期', desc: '果实开始形成与发育', color: '#C75050' },
  { name: '成熟期', desc: '果实成熟，准备收获', color: '#DAA520' },
]

export default function CropInfo({ cropState }) {
  if (!cropState || cropState.dayNumber < 1) return null

  const cropConfig = CROP_CONFIG[cropState.cropType] || { name: '作物', icon: '🌱', color: 'var(--primary)' }
  const stageConfig = STAGE_CONFIG[cropState.stage] || STAGE_CONFIG[0]

  return (
    <div>
      {/* 作物图片 */}
      <div style={{
        height: '140px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '20px',
        position: 'relative',
      }}>
        <img
          src={cropConfig.image}
          alt={cropConfig.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 50%, rgba(45,45,45,0.6) 100%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '32px' }}>{cropConfig.icon}</span>
          <div>
            <div style={{
              fontWeight: '600',
              fontSize: '20px',
              color: 'white',
              fontFamily: 'var(--font-display)',
            }}>
              {cropConfig.name}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
              生长第 {cropState.dayNumber} 天
            </div>
          </div>
        </div>
      </div>

      {/* 生长阶段 */}
      <div style={{
        padding: '16px',
        background: `${stageConfig.color}10`,
        borderRadius: '14px',
        marginBottom: '16px',
        border: `1px solid ${stageConfig.color}25`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <span style={{
            fontWeight: '600',
            fontSize: '16px',
            color: stageConfig.color,
          }}>
            {stageConfig.name}
          </span>
          <span style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            background: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
          }}>
            阶段 {cropState.stage + 1}/7
          </span>
        </div>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          {stageConfig.desc}
        </p>
      </div>

      {/* 数据指标 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        {/* 株高 */}
        <div style={{
          padding: '16px',
          background: 'var(--paper-cream)',
          borderRadius: '14px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/>
              <path d="M5 12l7-7 7 7"/>
            </svg>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>株高</span>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--earth-dark)',
          }}>
            {cropState.height}
            <span style={{ fontSize: '16px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '4px' }}>cm</span>
          </div>
        </div>
      </div>

      {/* 积温信息 */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(90,114,71,0.05) 0%, rgba(107,142,35,0.03) 100%)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>累积积温 (GDD)</div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--earth-dark)',
          }}>
            {cropState.accumulatedGdd?.toFixed(0) || 0}
            <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '4px' }}>°C·d</span>
          </div>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'var(--primary)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
