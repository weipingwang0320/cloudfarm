import React from 'react'

export default function TimeAccelerator({
  isRunning,
  onToggleRun,
  onBatchSimulate,
  dayNumber,
  disabled,
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 4px 4px 14px',
        background: '#f0faf0',
        borderRadius: 12,
        border: '1px solid #d0e8d0',
      }}>
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#2e7d32',
          whiteSpace: 'nowrap',
        }}>
          📅 第{dayNumber || 1}天
        </span>

        <button
          onClick={onToggleRun}
          disabled={disabled}
          title={isRunning ? '暂停自动推进' : '恢复自动推进'}
          style={{
            padding: '4px 12px', border: 'none', borderRadius: 8,
            background: isRunning ? '#ff9800' : '#4caf50',
            color: 'white', fontSize: 12, fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {isRunning ? '⏸ 暂停' : '▶ 运行'}
        </button>
      </div>

      <div style={{
        display: 'flex', gap: 6,
      }}>
        {[
          { label: '下一天', days: 1, icon: '⏩' },
          { label: '下五天', days: 5, icon: '⏭️' },
          { label: '下十天', days: 10, icon: '🚀' },
        ].map(({ label, days, icon }) => (
          <button
            key={days}
            onClick={() => onBatchSimulate(days)}
            disabled={disabled}
            style={{
              padding: '6px 14px', borderRadius: 10,
              background: disabled ? '#f0f0f0' : 'white',
              color: disabled ? '#bbb' : '#333',
              fontSize: 13, fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: disabled ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
              border: disabled ? '1px solid #e8e8e8' : '1px solid #e0e0e0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => {
              if (!disabled) {
                e.currentTarget.style.background = '#f5faf5'
                e.currentTarget.style.borderColor = '#4caf50'
                e.currentTarget.style.color = '#2e7d32'
              }
            }}
            onMouseLeave={e => {
              if (!disabled) {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.color = '#333'
              }
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}