import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = '/api'
const HISTORY_KEY = 'cloud_farm_ai_history'
const MAX_HISTORY = 50

const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const SUGGESTIONS = [
  { icon: '💧', text: '什么时候该浇水？', label: '灌溉咨询' },
  { icon: '🍂', text: '叶子发黄怎么办？', label: '病害诊断' },
  { icon: '🌱', text: '如何科学施肥？', label: '施肥指导' },
  { icon: '🐛', text: '常见虫害如何防治？', label: '虫害防治' },
  { icon: '🌤', text: '最近天气适合播种吗？', label: '农时规划' },
  { icon: '🌾', text: '水稻分蘖期怎么管理？', label: '阶段管理' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        role: 'bot',
        text: '你好！我是 **云上田园 AI 助手**，基于智谱 GLM-4.5-Air 大模型驱动。\n\n我可以帮你：\n- 🌱 解答种植技术问题\n- 🦠 诊断作物病虫害\n- 🌤 提供农事建议\n- 🧪 指导科学施肥\n- 📅 规划农事日历\n\n随时向我提问吧！',
        time: formatTime(),
      },
    ]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
    } catch {}
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', text, time: formatTime() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      const res = await axios.post(`${API_BASE}/diary/ask`, {
        question: text,
        enable_search: searchEnabled,
      })

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: res.data.data.answer, time: formatTime() },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: '抱歉，我暂时无法回答这个问题。请稍后再试。', time: formatTime() },
        ])
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '网络连接失败，请检查后端服务是否启动。', time: formatTime() },
      ])
    }

    setLoading(false)
  }

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const clearHistory = () => {
    const welcome = {
      role: 'bot',
      text: '对话已清空。有什么我可以帮你的吗？',
      time: formatTime(),
    }
    setMessages([welcome])
    setShowSuggestions(true)
    localStorage.removeItem(HISTORY_KEY)
  }

  const renderText = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold markers **...**
      const boldRegex = /\*\*(.+?)\*\*/g
      const parts = []
      let lastIdx = 0
      let match
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) parts.push(line.slice(lastIdx, match.index))
        parts.push(
          <strong key={match.index} style={{ color: 'var(--earth-dark)' }}>
            {match[1]}
          </strong>
        )
        lastIdx = match.index + match[0].length
      }
      if (lastIdx < line.length) parts.push(line.slice(lastIdx))

      if (/^#{1,3}\s/.test(line)) {
        const level = line.match(/^(#{1,3})\s/)[1].length
        const content = line.replace(/^#{1,3}\s/, '')
        const sizes = { 1: '18px', 2: '15px', 3: '14px' }
        return (
          <div key={i} style={{ fontWeight: '700', fontSize: sizes[level], marginTop: level === 1 ? '14px' : '8px', marginBottom: '4px', color: 'var(--earth-dark)' }}>
            {content}
          </div>
        )
      }
      if (/^\d+\.\s\*\*/.test(line)) {
        const match = line.match(/^\d+\.\s\*\*(.+?)\*\*(.*)/)
        if (match) {
          return (
            <div key={i} style={{ marginBottom: '4px', paddingLeft: '4px' }}>
              <span style={{ fontWeight: '600', color: '#5A7247' }}>{match[1]}</span>
              {match[2]}
            </div>
          )
        }
      }
      if (/^-\s/.test(line)) {
        return <div key={i} style={{ paddingLeft: '12px', marginBottom: '3px', opacity: 0.92 }}>• {line.replace(/^-\s/, '')}</div>
      }
      if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />
      return <span key={i}>{parts}{i < lines.length - 1 ? <br /> : null}</span>
    })
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'linear-gradient(180deg, #F7F5F0 0%, #EDEBE3 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <style>{`
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(90,114,71,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(90,114,71,0.06); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3D4A2E 0%, #4A5E35 40%, #5A7247 100%)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: '72px',
        zIndex: 10,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
              <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
            </svg>
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              background: '#4CAF50',
              borderRadius: '50%',
              border: '2px solid #4A5E35',
            }} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>
              AI 农场助手
            </div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', background: '#4CAF50', borderRadius: '50%', display: 'inline-block' }} />
              在线 · 智谱 GLM-4.5-Air · {searchEnabled ? '联网搜索已开启' : '基础问答模式'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setSearchEnabled(!searchEnabled)}
            title={searchEnabled ? '关闭联网搜索' : '开启联网搜索'}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: searchEnabled ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '12px',
              fontWeight: searchEnabled ? 700 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            {searchEnabled ? '搜索中' : '联网'}
          </button>
          <button
            onClick={clearHistory}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14"/>
            </svg>
            清空
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 32px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '860px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '14px', color: '#A69278', marginBottom: '16px', fontWeight: 500 }}>
              试试这些问题
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              maxWidth: '650px',
              margin: '0 auto',
            }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  disabled={loading}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid #E0DDD2',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#5D4E37',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#5A7247'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(90,114,71,0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0DDD2'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '11px', color: '#A69278' }}>{s.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '12px',
              animation: 'msgSlideIn 0.35s ease both',
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              boxShadow: msg.role === 'user'
                ? '0 2px 8px rgba(90,114,71,0.2)'
                : '0 2px 8px rgba(139,115,85,0.15)',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #DAA520 0%, #E8A87C 100%)'
                : 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: msg.role === 'user' ? '12px' : '15px',
            }}>
              {msg.role === 'user' ? '我' : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                </svg>
              )}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '72%', minWidth: '60px' }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 6px 18px'
                  : '18px 18px 18px 6px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #5A7247 0%, #4A5E35 100%)'
                  : '#FFFFFF',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '14.5px',
                lineHeight: '1.8',
                boxShadow: msg.role === 'user'
                  ? '0 4px 16px rgba(90,114,71,0.25)'
                  : '0 2px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
                position: 'relative',
              }}>
                {msg.role === 'bot' ? renderText(msg.text) : msg.text}

                {msg.role === 'bot' && (
                  <button
                    onClick={() => copyMessage(msg.text)}
                    title="复制"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.3,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                )}
              </div>

              <div style={{
                fontSize: '11px',
                color: '#B0A89A',
                marginTop: '5px',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                paddingLeft: msg.role === 'bot' ? '6px' : 0,
                paddingRight: msg.role === 'user' ? '6px' : 0,
              }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', animation: 'msgSlideIn 0.3s ease both' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #5A7247 0%, #6B8E23 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(139,115,85,0.15)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
                <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              </svg>
            </div>
            <div style={{
              padding: '16px 22px',
              borderRadius: '18px 18px 18px 6px',
              background: 'white',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5A7247', animation: 'dotBounce 1.4s infinite' }} />
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5A7247', animation: 'dotBounce 1.4s infinite 0.2s' }} />
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5A7247', animation: 'dotBounce 1.4s infinite 0.4s' }} />
            </div>
          </div>
        )}

        <div style={{ height: '20px', flexShrink: 0 }} />
      </div>

      {/* Input area */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, white 40%)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        padding: '16px 32px 24px',
        flexShrink: 0,
      }}>
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          background: '#F5F1E8',
          borderRadius: '18px',
          padding: '6px',
          border: '2px solid transparent',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
          onFocusCapture={() => {
            const el = document.getElementById('ai-input-wrapper')
            if (el) { el.style.borderColor = '#5A7247'; el.style.boxShadow = '0 0 0 4px rgba(90,114,71,0.08)' }
          }}
          onBlurCapture={() => {
            const el = document.getElementById('ai-input-wrapper')
            if (el) { el.style.borderColor = 'transparent'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }
          }}
          id="ai-input-wrapper"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder={loading ? 'AI 正在思考...' : '输入你的问题，Enter 发送...'}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px 18px',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontFamily: 'inherit',
              outline: 'none',
              background: 'transparent',
              color: '#3d3929',
              minWidth: 0,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              background: loading || !input.trim()
                ? '#E0DDD2'
                : 'linear-gradient(135deg, #5A7247 0%, #4A5E35 100%)',
              color: 'white',
              cursor: loading || !input.trim() ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              animation: !loading && input.trim() ? 'glowPulse 2s infinite' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(90,114,71,0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div style={{
          maxWidth: '860px',
          margin: '8px auto 0',
          fontSize: '11px',
          color: '#B0A89A',
          textAlign: 'center',
        }}>
          AI 助手由智谱 GLM-4.5-Air 大模型驱动 · 信息仅供参考
        </div>
      </div>
    </div>
  )
}
