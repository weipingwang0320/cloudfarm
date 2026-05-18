import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = '/api'

const QUICK_QUESTIONS = [
  { icon: '💧', text: '什么时候该浇水？' },
  { icon: '🍂', text: '叶子发黄怎么办？' },
]

const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '你好！我是农场助手，有任何种植或天气问题都可以问我。', time: formatTime() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0 })
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPosition({
        x: dragRef.current.startLeft + dx,
        y: dragRef.current.startTop + dy,
      })
    }
    const handleUp = () => setDragging(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragging])

  const onDragStart = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x || rect.left,
      startTop: position.y || rect.top,
    }
    setDragging(true)
  }

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', text, time: formatTime() }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/diary/ask`, {
        question: text,
        enable_search: searchEnabled,
      })

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: res.data.data.answer, time: formatTime() }])
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: '抱歉，我暂时无法回答这个问题。请稍后再试。', time: formatTime() }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: '网络连接失败，请检查后端服务是否启动。', time: formatTime() }])
    }

    setLoading(false)
  }

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const renderText = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      let formatted = line
      if (/^#{1,3}\s/.test(line)) {
        const level = line.match(/^(#{1,3})\s/)[1].length
        const content = line.replace(/^#{1,3}\s/, '')
        const sizes = { 1: '17px', 2: '15px', 3: '14px' }
        return (
          <div key={i} style={{ fontWeight: '700', fontSize: sizes[level], marginTop: level === 1 ? '12px' : '8px', marginBottom: '4px', color: 'var(--earth-dark)' }}>
            {content}
          </div>
        )
      }
      if (/^\d+\.\s\*\*/.test(line)) {
        const match = line.match(/^\d+\.\s\*\*(.+?)\*\*(.*)/)
        if (match) {
          return (
            <div key={i} style={{ marginBottom: '2px', paddingLeft: '4px' }}>
              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{match[1]}</span>
              {match[2]}
            </div>
          )
        }
      }
      if (/^-\s/.test(line)) {
        return <div key={i} style={{ paddingLeft: '12px', marginBottom: '2px', opacity: 0.9 }}>• {line.replace(/^-\s/, '')}</div>
      }
      if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />
      return <span key={i}>{line}{i < lines.length - 1 ? <br /> : null}</span>
    })
  }

  const posStyle = (position.x || position.y) ? {
    left: `${position.x}px`,
    top: `${position.y}px`,
    bottom: 'auto',
    right: 'auto',
  } : {
    bottom: '100px',
    right: '32px',
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        ...posStyle,
        zIndex: 200,
        width: '420px',
        height: '560px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(93,78,55,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
        userSelect: dragging ? 'none' : 'auto',
      }}
    >
      {/* Header with drag handle */}
      <div
        onMouseDown={onDragStart}
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #4A5E35 0%, #5A7247 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'grab',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            position: 'relative',
          }}>
            🤖
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              background: '#4CAF50',
              borderRadius: '50%',
              border: '2px solid #4A5E35',
            }} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px', letterSpacing: '0.02em' }}>农场助手</div>
            <div style={{ fontSize: '11px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                background: '#4CAF50',
                borderRadius: '50%',
                display: 'inline-block',
              }} />
              在线 · AI 智能问答
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSearchEnabled(!searchEnabled) }}
            title={searchEnabled ? '关闭联网搜索' : '开启联网搜索'}
            style={{
              background: searchEnabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: searchEnabled ? '600' : '400',
              transition: 'all 0.2s ease',
              opacity: searchEnabled ? 1 : 0.7,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            {searchEnabled ? '搜索中' : '联网'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: '#F7F5F0',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '10px',
              animation: 'slideUp 0.3s ease both',
            }}
          >
            {/* Avatar */}
            {msg.role === 'bot' ? (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(90,114,71,0.25)',
              }}>
                🤖
              </div>
            ) : (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E8A87C 0%, #DAA520 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
                color: 'white',
                fontWeight: '600',
              }}>
                我
              </div>
            )}

            {/* Bubble */}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)'
                  : 'white',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '13.5px',
                lineHeight: 1.75,
                boxShadow: msg.role === 'user'
                  ? '0 4px 12px rgba(90,114,71,0.25)'
                  : '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                position: 'relative',
              }}>
                {msg.role === 'bot' ? renderText(msg.text) : msg.text}

                {/* Copy button for bot messages */}
                {msg.role === 'bot' && (
                  <button
                    onClick={() => copyMessage(msg.text)}
                    title="复制"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.4,
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                )}
              </div>
              {/* Timestamp */}
              <div style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                paddingLeft: msg.role === 'bot' ? '4px' : '0',
                paddingRight: msg.role === 'user' ? '4px' : '0',
              }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              🤖
            </div>
            <div style={{
              padding: '14px 20px',
              borderRadius: '16px 16px 16px 4px',
              background: 'white',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                width: '7px',
                height: '7px',
                background: 'var(--primary)',
                borderRadius: '50%',
                animation: 'chatBounce 1.2s infinite',
              }} />
              <div style={{
                width: '7px',
                height: '7px',
                background: 'var(--primary)',
                borderRadius: '50%',
                animation: 'chatBounce 1.2s infinite 0.15s',
              }} />
              <div style={{
                width: '7px',
                height: '7px',
                background: 'var(--primary)',
                borderRadius: '50%',
                animation: 'chatBounce 1.2s infinite 0.3s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick questions */}
      <div style={{
        padding: '10px 16px 0',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        background: 'white',
      }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q.text)}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              border: '1px solid var(--border-light)',
              borderRadius: '18px',
              background: 'var(--paper-cream)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
              e.currentTarget.style.background = 'rgba(90,114,71,0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'var(--paper-cream)'
            }}
          >
            <span style={{ fontSize: '14px' }}>{q.icon}</span>
            {q.text}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderTop: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="输入问题，Enter 发送..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1.5px solid var(--border-light)',
              borderRadius: '14px',
              fontSize: '13.5px',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              background: '#F7F5F0',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(90,114,71,0.08)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: '44px',
              height: '44px',
              background: loading || !input.trim()
                ? 'var(--border-light)'
                : 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              cursor: loading || !input.trim() ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
