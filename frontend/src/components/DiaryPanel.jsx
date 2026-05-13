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
    <div>
      <div className="panel-header">
        <div className="panel-icon" style={{ background: '#fce4ec' }}>📖</div>
        <span className="panel-title">AI生长周记</span>
        {entries.length > 0 && (
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
            共{entries.length}篇
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#f0fdf0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24, margin: '0 auto 10px',
          }}>
            🌱
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-light)' }}>认领地块后开始种植</p>
          <p style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>AI将每周为你生成生长周记</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            maxHeight: 380, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 8,
            paddingRight: 2,
          }}
        >
          {[...entries].sort((a, b) => b.day - a.day).map((entry, i) => (
            <div
              key={entry.id}
              className="fade-in"
              style={{
                padding: '12px 14px',
                background: i === 0 ? '#f0fdf0' : '#f8faf8',
                borderRadius: 12,
                border: i === 0 ? '1px solid #a5d6a7' : '1px solid #e8ece8',
                boxShadow: i === 0 ? '0 2px 8px rgba(76,175,80,0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#2e7d32',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#4caf50', display: 'inline-block',
                  }} />
                  {entry.stage}
                </span>
                <span style={{
                  fontSize: 11, color: '#999',
                  background: '#f0f4f0', padding: '1px 8px', borderRadius: 8,
                }}>
                  第{entry.week || Math.ceil(entry.day / 7)}周 · 第{entry.day}天
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#444' }}>{entry.content}</p>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#aaa' }}>健康度</span>
                <div style={{ flex: 1, height: 3, background: '#e8f5e9', borderRadius: 2 }}>
                  <div style={{
                    width: `${entry.health}%`,
                    height: '100%',
                    background: entry.health >= 80 ? '#4caf50' : entry.health >= 50 ? '#ff9800' : '#f44336',
                    borderRadius: 2,
                    transition: 'width 0.5s',
                  }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, minWidth: 24, textAlign: 'right',
                  color: entry.health >= 80 ? '#4caf50' : entry.health >= 50 ? '#ff9800' : '#f44336',
                }}>
                  {entry.health}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}