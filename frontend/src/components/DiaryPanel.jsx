import React, { useRef, useEffect } from 'react'

export default function DiaryPanel({ entries }) {
  const scrollRef = useRef(null)
  const isNearBottomRef = useRef(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const threshold = 60
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distFromBottom < threshold
  }, [entries.length])

  useEffect(() => {
    if (scrollRef.current && isNearBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const threshold = 60
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distFromBottom < threshold
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'rgba(139,115,85,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--earth-brown)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </div>
        <span className="panel-title">生长日记</span>
        {entries.length > 0 && (
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
            {entries.length} 篇
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(90,114,71,0.1) 0%, rgba(107,142,35,0.05) 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
              <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
            </svg>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--earth-dark)', fontWeight: '500', marginBottom: '8px' }}>
            开始你的种植之旅
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            选择一块土地，种下种子<br />每周自动生成生长日记
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingRight: '4px',
          }}
        >
          {[...entries].sort((a, b) => b.day - a.day).map((entry, i) => (
            <div
              key={entry.id}
              className="fade-in"
              style={{
                padding: '16px',
                background: i === 0
                  ? 'linear-gradient(135deg, rgba(90,114,71,0.08) 0%, rgba(107,142,35,0.04) 100%)'
                  : 'var(--paper-cream)',
                borderRadius: '14px',
                border: i === 0 ? '1px solid rgba(90,114,71,0.2)' : '1px solid transparent',
                boxShadow: i === 0 ? '0 4px 12px rgba(90,114,71,0.08)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--primary)',
                  }}>
                    {entry.stage}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  background: 'white',
                  padding: '4px 10px',
                  borderRadius: '8px',
                }}>
                  第{entry.week || Math.ceil(entry.day / 7)}周 · 第{entry.day}天
                </span>
              </div>

              <p style={{
                fontSize: '14px',
                lineHeight: 1.75,
                color: 'var(--text-primary)',
              }}>
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
