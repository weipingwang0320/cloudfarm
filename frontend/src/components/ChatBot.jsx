import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = '/api'

const QUICK_QUESTIONS = [
  '什么时候该浇水？',
  '需要施肥吗？',
  '叶子发黄怎么办？',
  '什么时候可以收获？',
]

export default function ChatBot({ cropState, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '你好！我是农场助手，有任何种植问题都可以问我。' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/diary/ask`, {
        question: text,
        crop_type: cropState.cropType,
        stage: cropState.stage,
        height: cropState.height,
      })

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: res.data.data.answer }])
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: '抱歉，我暂时无法回答这个问题。请稍后再试。' }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: '网络连接失败，请检查后端服务是否启动。' }])
    }

    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '384px',
      zIndex: 200,
      width: '400px',
      height: '520px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 16px 48px rgba(93,78,55,0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideUp 0.3s ease',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>农场助手</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>随时为您解答种植问题</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* 消息区域 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--rice-white)',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 6px 18px'
                : '18px 18px 18px 6px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%)'
                : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: 1.7,
              boxShadow: msg.role === 'user'
                ? '0 4px 16px rgba(90,114,71,0.2)'
                : 'var(--shadow-soft)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 6px',
              background: 'white',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: 'var(--primary)',
                borderRadius: '50%',
                animation: 'bounce 1s infinite',
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                background: 'var(--primary)',
                borderRadius: '50%',
                animation: 'bounce 1s infinite 0.2s',
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                background: 'var(--primary)',
                borderRadius: '50%',
                animation: 'bounce 1s infinite 0.4s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* 快捷问题 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-light)',
        background: 'white',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                background: 'var(--paper-cream)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.color = 'var(--primary)'
                e.currentTarget.style.background = 'rgba(90,114,71,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'var(--paper-cream)'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* 输入框 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="输入您的问题..."
            style={{
              flex: 1,
              padding: '14px 18px',
              border: '1px solid var(--border-light)',
              borderRadius: '14px',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              padding: '14px 20px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              opacity: loading || !input.trim() ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            发送
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
