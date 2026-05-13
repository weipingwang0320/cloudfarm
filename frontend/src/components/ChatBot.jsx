import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = '/api'

const QUICK_QUESTIONS = [
  '什么时候该浇水？',
  '我的作物健康吗？',
  '叶子发黄怎么办？',
  '什么时候可以收获？',
  '需要施肥吗？',
  '有病虫害怎么办？',
]

export default function ChatBot({ cropState, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🤖 你好！我是AI农场管家，有什么关于种植的问题可以问我哦！' },
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
        health_score: cropState.healthScore,
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
      position: 'fixed', bottom: 80, right: 16, zIndex: 200,
      width: 380, height: 500,
      background: 'white', borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px', background: 'var(--primary)',
        color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <span style={{ fontWeight: 600 }}>AI农场管家</span>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none',
          color: 'white', width: 28, height: 28, borderRadius: '50%',
          cursor: 'pointer', fontSize: 16,
        }}>✕</button>
      </div>

      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? 'var(--primary)' : '#f0f7f0',
              color: msg.role === 'user' ? 'white' : 'var(--text)',
              fontSize: 14,
              lineHeight: 1.6,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px', borderRadius: '12px 12px 12px 4px',
              background: '#f0f7f0', fontSize: 14,
            }}>
              思考中...
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              style={{
                padding: '4px 10px', fontSize: 12, border: '1px solid var(--border)',
                borderRadius: 12, background: '#f9fdf9', cursor: 'pointer',
                color: 'var(--text-light)', whiteSpace: 'nowrap',
              }}
            >
              {q}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="输入您的问题..."
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 14, outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 16px', background: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16,
              opacity: loading || !input.trim() ? 0.6 : 1,
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}