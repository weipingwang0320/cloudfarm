import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = '/api'
const HISTORY_KEY = 'cloud_farm_ai_history'
const MAX_HISTORY = 50

// ── 人机验证：简单数学题，零外部依赖 ──
const genCaptcha = () => {
  const a = Math.floor(Math.random() * 8) + 2   // 2~9
  const b = Math.floor(Math.random() * 8) + 2   // 2~9
  return { question: `${a} + ${b} = ?`, answer: a + b }
}

const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const SUGGESTIONS = [
  { icon: '💧', label: '灌溉咨询', text: '什么时候该浇水？' },
  { icon: '🍂', label: '病害诊断', text: '叶子发黄怎么办？' },
  { icon: '🌱', label: '施肥指导', text: '如何科学施肥？' },
  { icon: '🐛', label: '虫害防治', text: '常见虫害如何防治？' },
  { icon: '🌤', label: '农时规划', text: '最近天气适合播种吗？' },
  { icon: '🌾', label: '阶段管理', text: '水稻分蘖期怎么管理？' },
]

// ── Markdown Renderer ──────────────────────────────────
const Markdown = ({ text }) => {
  if (!text) return null

  const renderInline = (str) => {
    const parts = []
    let remaining = str
    let key = 0

    // Process inline elements
    while (remaining.length > 0) {
      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/)
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      // Italic
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/)

      const matches = [
        codeMatch && { idx: codeMatch.index, len: codeMatch[0].length, type: 'code', content: codeMatch[1] },
        boldMatch && { idx: boldMatch.index, len: boldMatch[0].length, type: 'bold', content: boldMatch[1] },
        italicMatch && { idx: italicMatch.index, len: italicMatch[0].length, type: 'italic', content: italicMatch[1] },
      ].filter(Boolean).sort((a, b) => a.idx - b.idx)

      if (matches.length === 0) {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }

      const m = matches[0]
      if (m.idx > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, m.idx)}</span>)
      }

      if (m.type === 'code') {
        parts.push(
          <code key={key++} style={{
            background: 'rgba(0,0,0,0.06)',
            padding: '1px 6px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
            color: '#C75050',
          }}>{m.content}</code>
        )
      } else if (m.type === 'bold') {
        parts.push(<strong key={key++} style={{ color: 'var(--earth-dark)' }}>{m.content}</strong>)
      } else if (m.type === 'italic') {
        parts.push(<em key={key++}>{m.content}</em>)
      }

      remaining = remaining.slice(m.idx + m.len)
    }

    return parts
  }

  const lines = text.split('\n')
  const result = []
  let i = 0
  let codeBlock = null
  let codeLines = []

  const flushCodeBlock = () => {
    if (codeBlock) {
      result.push(
        <div key={`code-${codeBlock.key}`} style={{
          background: '#1E1E1E',
          borderRadius: '10px',
          margin: '12px 0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#2A2A2A',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {codeBlock.lang || 'code'}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(codeLines.join('\n')).catch(() => {})}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none' }}
            >
              复制
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: '14px 16px',
            overflowX: 'auto',
            fontSize: '13px',
            lineHeight: '1.65',
            color: '#E0E0E0',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}><code>{codeLines.join('\n')}</code></pre>
        </div>
      )
      codeBlock = null
      codeLines = []
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    // Code block start/end
    if (/^```/.test(line)) {
      if (codeBlock) {
        flushCodeBlock()
      } else {
        const lang = line.replace(/^```/, '').trim()
        codeBlock = { key: i, lang: lang || 'plain' }
      }
      i++
      continue
    }

    if (codeBlock) {
      codeLines.push(line)
      i++
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      flushCodeBlock()
      const level = headingMatch[1].length
      const sizes = { 1: 22, 2: 17, 3: 15 }
      const margins = { 1: '20px 0 8px', 2: '16px 0 6px', 3: '12px 0 4px' }
      result.push(
        <div key={i} style={{
          fontSize: `${sizes[level]}px`,
          fontWeight: 700,
          margin: margins[level],
          color: 'var(--earth-dark)',
          lineHeight: 1.4,
        }}>
          {renderInline(headingMatch[2])}
        </div>
      )
      i++
      continue
    }

    // Numbered list with bold prefix
    const numBoldMatch = line.match(/^(\d+)\.\s\*\*(.+?)\*\*(.*)/)
    if (numBoldMatch) {
      flushCodeBlock()
      result.push(
        <div key={i} style={{ paddingLeft: '4px', marginBottom: '6px', lineHeight: 1.7 }}>
          <span style={{
            display: 'inline-block',
            minWidth: '22px',
            height: '22px',
            lineHeight: '22px',
            borderRadius: '11px',
            background: 'rgba(90,114,71,0.1)',
            color: '#5A7247',
            fontSize: '12px',
            fontWeight: 700,
            textAlign: 'center',
            marginRight: '8px',
          }}>{numBoldMatch[1]}</span>
          <strong style={{ color: 'var(--earth-dark)' }}>{numBoldMatch[2]}</strong>
          <span>{numBoldMatch[3]}</span>
        </div>
      )
      i++
      continue
    }

    // Bullet list
    if (/^-\s/.test(line)) {
      flushCodeBlock()
      result.push(
        <div key={i} style={{ paddingLeft: '8px', marginBottom: '4px', lineHeight: 1.7, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: '#5A7247', flexShrink: 0, marginTop: '1px' }}>•</span>
          <span>{renderInline(line.replace(/^-\s/, ''))}</span>
        </div>
      )
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushCodeBlock()
      result.push(<div key={i} style={{ height: '8px' }} />)
      i++
      continue
    }

    // Regular text
    flushCodeBlock()
    result.push(
      <div key={i} style={{ lineHeight: 1.75 }}>
        {renderInline(line)}
      </div>
    )
    i++
  }

  flushCodeBlock()

  return <>{result}</>
}

// ── Avatar Icon ────────────────────────────────────────
const BotAvatar = ({ size = 32 }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3D4A2E 0%, #5A7247 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(90,114,71,0.2)',
    position: 'relative',
  }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
      <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
    </svg>
    <div style={{
      position: 'absolute',
      bottom: '-1px',
      right: '-1px',
      width: `${size * 0.28}px`,
      height: `${size * 0.28}px`,
      background: '#4CAF50',
      borderRadius: '50%',
      border: '2px solid white',
    }} />
  </div>
)

const UserAvatar = ({ size = 32 }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #DAA520 0%, #E8A87C 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'white',
    fontWeight: 700,
    fontSize: `${size * 0.38}px`,
    boxShadow: '0 2px 8px rgba(218,165,32,0.2)',
  }}>我</div>
)

// ── Main Component ─────────────────────────────────────
export default function AIAssistantPage() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        role: 'bot',
        text: '你好！我是 **云上田园 AI 助手**，基于智谱 GLM-4.5-Air 大模型驱动。\n\n我可以帮你：\n- 解答种植技术问题\n- 诊断作物病虫害\n- 提供农事建议\n- 指导科学施肥\n- 规划农事日历\n\n随时向我提问吧！',
        time: formatTime(),
      },
    ]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [modelProvider, setModelProvider] = useState('glm')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      return !saved || JSON.parse(saved).length <= 1
    } catch { return true }
  })
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // ── 数学验证码 ──
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaData, setCaptchaData] = useState(() => genCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const pendingTextRef = useRef('')
  const captchaInputRef = useRef(null)

  // Count messages sent by user (exclude initial welcome bot message)
  const userMsgCount = messages.filter(m => m.role === 'user').length

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [])

  // Track whether user has scrolled away from bottom
  const handleMessagesScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      // Show button if scrolled more than 200px from bottom
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
    }
  }, [])

  // Auto-scroll when new messages arrive (only if already near bottom)
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
      if (isNearBottom) {
        scrollToBottom()
      }
    }
  }, [messages, loading, scrollToBottom])

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
    } catch {}
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  // Focus textarea on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 300)
  }, [])

  // ── Captcha: auto-focus input when modal opens ──
  useEffect(() => {
    if (showCaptcha) {
      setTimeout(() => captchaInputRef.current?.focus(), 100)
    }
  }, [showCaptcha])

  // ── Captcha submit handler ──
  const handleCaptchaSubmit = () => {
    const num = parseInt(captchaInput, 10)
    if (num === captchaData.answer) {
      setCaptchaVerified(true)
      setShowCaptcha(false)
      setCaptchaInput('')
      setCaptchaError(false)
      const pending = pendingTextRef.current
      pendingTextRef.current = ''
      if (pending) {
        sendMessage(pending, true)
      }
    } else {
      setCaptchaError(true)
      setCaptchaInput('')
      setCaptchaData(genCaptcha()) // refresh question on failure
      setTimeout(() => setCaptchaError(false), 600)
      setTimeout(() => captchaInputRef.current?.focus(), 100)
    }
  }

  const sendMessage = async (text, skipVerification = false) => {
    if (!text.trim() || loading) return

    // ── Captcha check: trigger on second question onwards ──
    if (!skipVerification && !captchaVerified && userMsgCount >= 1) {
      pendingTextRef.current = text
      setCaptchaData(genCaptcha())
      setCaptchaInput('')
      setCaptchaError(false)
      setShowCaptcha(true)
      return
    }

    const userMsg = { role: 'user', text, time: formatTime() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      // Collect last 3 conversation turns (up to 6 messages) for context
      const recentHistory = [];
      const recent = messages.slice(-6); // last 6 messages = 3 user+bot pairs
      for (const msg of recent) {
        if (msg.text && msg.text.length > 0) {
          recentHistory.push({ role: msg.role, text: msg.text });
        }
      }

      const res = await axios.post(`${API_BASE}/diary/ask`, {
        question: text,
        enable_search: searchEnabled,
        history: recentHistory,
        model_provider: modelProvider,
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
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }).catch(() => {})
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div style={{
      height: 'calc(100vh - 72px)',
      overflow: 'hidden',
      background: '#FAF8F5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Animations */}
      <style>{`
        @keyframes msgSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes thinkingDot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(90,114,71,0.15); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
          50% { border-color: rgba(90,114,71,0.35); box-shadow: 0 2px 20px rgba(90,114,71,0.08); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes captchaShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .chat-scroll::-webkit-scrollbar { width: 5px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.18); }
      `}</style>

      {/* ── Header ────────────────────────────────── */}
      <div style={{
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: '#FAF8F5',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BotAvatar size={38} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--earth-dark)', letterSpacing: '0.02em' }}>
              云上田园 AI 助手
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#4CAF50', borderRadius: '50%', display: 'inline-block' }} />
              {modelProvider === 'deepseek' ? 'DeepSeek-V4' : '智谱 GLM-4.5-Air'}{searchEnabled ? ' · 联网搜索' : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Search toggle */}
          <button
            onClick={() => setSearchEnabled(!searchEnabled)}
            title={searchEnabled ? '关闭联网搜索' : '开启联网搜索'}
            style={{
              padding: '7px 14px',
              borderRadius: '10px',
              border: '1.5px solid',
              borderColor: searchEnabled ? '#5A7247' : 'rgba(0,0,0,0.1)',
              background: searchEnabled ? 'rgba(90,114,71,0.06)' : 'transparent',
              color: searchEnabled ? '#5A7247' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: searchEnabled ? 600 : 400,
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
            {searchEnabled ? '搜索中' : '联网搜索'}
          </button>

          {/* Model selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setModelMenuOpen(!modelMenuOpen)}
              title="切换AI模型"
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.1)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              {modelProvider === 'deepseek' ? 'DeepSeek' : 'GLM 智谱'}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
                transform: modelMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {modelMenuOpen && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setModelMenuOpen(false)} />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  zIndex: 300,
                  minWidth: '150px',
                }}>
                  <div
                    onClick={() => { setModelProvider('glm'); setModelMenuOpen(false) }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: modelProvider === 'glm' ? '#5A7247' : '#555',
                      background: modelProvider === 'glm' ? 'rgba(90,114,71,0.06)' : 'transparent',
                      fontWeight: modelProvider === 'glm' ? '600' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(90,114,71,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = modelProvider === 'glm' ? 'rgba(90,114,71,0.06)' : 'transparent'}
                  >
                    <span style={{ fontSize: '14px' }}>🧠</span> GLM 智谱
                    {modelProvider === 'glm' && <span style={{ marginLeft: 'auto', color: '#5A7247' }}>✓</span>}
                  </div>
                  <div style={{ height: '1px', background: '#eee' }} />
                  <div
                    onClick={() => { setModelProvider('deepseek'); setModelMenuOpen(false) }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: modelProvider === 'deepseek' ? '#5A7247' : '#555',
                      background: modelProvider === 'deepseek' ? 'rgba(90,114,71,0.06)' : 'transparent',
                      fontWeight: modelProvider === 'deepseek' ? '600' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(90,114,71,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = modelProvider === 'deepseek' ? 'rgba(90,114,71,0.06)' : 'transparent'}
                  >
                    <span style={{ fontSize: '14px' }}>⚡</span> DeepSeek
                    {modelProvider === 'deepseek' && <span style={{ marginLeft: 'auto', color: '#5A7247' }}>✓</span>}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Clear */}
          <button
            onClick={clearHistory}
            title="清空对话"
            style={{
              padding: '7px 14px',
              borderRadius: '10px',
              border: '1.5px solid rgba(0,0,0,0.1)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#C75050'
              e.currentTarget.style.color = '#C75050'
              e.currentTarget.style.background = 'rgba(199,80,80,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14"/>
            </svg>
            清空对话
          </button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────── */}
      <div
        ref={scrollRef}
        className="chat-scroll"
        onScroll={handleMessagesScroll}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxWidth: '780px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Welcome / Suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0 20px',
            animation: 'msgSlideUp 0.5s ease both',
          }}>
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #3D4A2E 0%, #5A7247 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 32px rgba(90,114,71,0.2)',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4-4 8-7.582 8-12a8 8 0 1 0-16 0c0 4.418 4 8 8 12Z"/>
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                </svg>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--earth-dark)', fontFamily: 'var(--font-display)' }}>
                今天需要什么帮助？
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                我精通种植技术、病虫害防治、施肥指导等农事问题
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '10px',
              maxWidth: '620px',
              margin: '0 auto',
            }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '13px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(0,0,0,0.06)',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#5A7247'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(90,114,71,0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '14px',
              padding: '16px 20px',
              borderRadius: '16px',
              animation: 'msgSlideUp 0.35s ease both',
              animationDelay: `${Math.min(i * 0.03, 0.3)}s`,
              background: msg.role === 'bot' ? 'transparent' : 'rgba(90,114,71,0.03)',
              marginTop: i > 0 ? '2px' : 0,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {msg.role === 'bot' ? <BotAvatar size={32} /> : <UserAvatar size={32} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Role label */}
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: msg.role === 'bot' ? '#5A7247' : '#DAA520',
                marginBottom: '4px',
                letterSpacing: '0.03em',
              }}>
                {msg.role === 'bot' ? 'AI 助手' : '你'}
              </div>

              {/* Message content */}
              <div style={{
                fontSize: '15px',
                lineHeight: 1.75,
                color: 'var(--text-primary)',
                wordBreak: 'break-word',
              }}>
                {msg.role === 'bot' ? <Markdown text={msg.text} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>}
              </div>

              {/* Actions row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {msg.time}
                </span>

                {msg.role === 'bot' && (
                  <button
                    onClick={() => copyMessage(msg.text, i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: copiedIdx === i ? '#4CAF50' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => { if (copiedIdx !== i) e.currentTarget.style.color = 'var(--text-secondary)' }}
                    onMouseLeave={e => { if (copiedIdx !== i) e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    {copiedIdx === i ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        复制
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{
            display: 'flex',
            gap: '14px',
            padding: '16px 20px',
            borderRadius: '16px',
            animation: 'msgSlideUp 0.3s ease both',
          }}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <BotAvatar size={32} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#5A7247',
                marginBottom: '10px',
                letterSpacing: '0.03em',
              }}>
                AI 助手正在思考
                <span style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#5A7247',
                  marginLeft: '2px',
                  animation: 'thinkingDot 1.4s infinite 0.2s',
                  verticalAlign: 'middle',
                }} />
                <span style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#5A7247',
                  marginLeft: '3px',
                  animation: 'thinkingDot 1.4s infinite 0.4s',
                  verticalAlign: 'middle',
                }} />
                <span style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#5A7247',
                  marginLeft: '3px',
                  animation: 'thinkingDot 1.4s infinite 0.6s',
                  verticalAlign: 'middle',
                }} />
              </div>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: 'linear-gradient(90deg, rgba(90,114,71,0.06) 0%, rgba(90,114,71,0.12) 50%, rgba(90,114,71,0.06) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                width: '60%',
              }} />
            </div>
          </div>
        )}

        <div style={{ height: '24px', flexShrink: 0 }} />

        {/* Floating scroll-to-bottom button — sticky inside scroll area */}
        {showScrollBtn && (
          <div style={{
            position: 'sticky',
            bottom: '12px',
            alignSelf: 'center',
            width: 0,
            height: 0,
            zIndex: 5,
          }}>
            <button
              onClick={() => scrollToBottom()}
              style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '1.5px solid rgba(0,0,0,0.08)',
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                animation: 'msgSlideUp 0.3s ease both',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.08)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(90,114,71,0.2)'
                e.currentTarget.style.borderColor = '#5A7247'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
              }}
              aria-label="滚动到底部"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5A7247" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Input Area ────────────────────────────── */}
      <div style={{
        padding: '16px 20px 24px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(250,248,245,0) 0%, rgba(250,248,245,0.95) 30%, rgba(250,248,245,1) 100%)',
      }}>
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
            background: 'white',
            borderRadius: '18px',
            padding: '8px',
            border: '2px solid rgba(90,114,71,0.12)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
            transition: 'all 0.25s ease',
            animation: loading ? 'none' : 'none',
          }}
            id="chat-input-wrapper"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                const wrapper = document.getElementById('chat-input-wrapper')
                if (wrapper) {
                  wrapper.style.borderColor = 'rgba(90,114,71,0.35)'
                  wrapper.style.boxShadow = '0 4px 28px rgba(90,114,71,0.08), 0 0 0 1px rgba(0,0,0,0.02)'
                }
              }}
              onBlur={(e) => {
                const wrapper = document.getElementById('chat-input-wrapper')
                if (wrapper) {
                  wrapper.style.borderColor = 'rgba(90,114,71,0.12)'
                  wrapper.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)'
                }
              }}
              placeholder={loading ? 'AI 正在回复...' : '输入你的农事问题...'}
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                padding: '10px 8px 10px 14px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                resize: 'none',
                minWidth: 0,
                lineHeight: 1.6,
                alignSelf: 'center',
              }}
            />

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              {/* Shortcut hint */}
              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                opacity: 0.5,
                whiteSpace: 'nowrap',
                display: input ? 'none' : 'block',
              }}>
                Enter ↵
              </span>

              {/* Send button */}
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '13px',
                  border: 'none',
                  background: loading || !input.trim()
                    ? 'rgba(0,0,0,0.05)'
                    : 'linear-gradient(135deg, #5A7247 0%, #3D4A2E 100%)',
                  color: loading || !input.trim()
                    ? 'rgba(0,0,0,0.2)'
                    : 'white',
                  cursor: loading || !input.trim() ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: (loading || !input.trim())
                    ? 'none'
                    : '0 2px 10px rgba(90,114,71,0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.transform = 'scale(1.06)'
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(90,114,71,0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = (!loading && input.trim())
                    ? '0 2px 10px rgba(90,114,71,0.3)'
                    : 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            maxWidth: '780px',
            margin: '8px auto 0',
            fontSize: '11px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            opacity: 0.7,
          }}>
            AI 助手由 {modelProvider === 'deepseek' ? 'DeepSeek-V4' : '智谱 GLM-4.5-Air'} 大模型驱动 · 信息仅供参考 · Shift+Enter 换行
          </div>
        </div>
      </div>

      {/* ── 人机验证弹窗 ──────────────────────── */}
      {showCaptcha && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'msgSlideUp 0.25s ease both',
        }}>
          {/* Backdrop */}
          <div
            onClick={() => {
              setShowCaptcha(false)
              pendingTextRef.current = ''
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Card */}
          <div style={{
            position: 'relative',
            background: 'white',
            borderRadius: '20px',
            padding: '32px 28px 24px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            minWidth: '300px',
            maxWidth: '360px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3D4A2E 0%, #5A7247 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--earth-dark)', marginBottom: '4px' }}>
                人机验证
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                为保证服务质量，请完成下方验证
              </div>
            </div>
            {/* Math question */}
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--earth-dark)',
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              background: 'rgba(90,114,71,0.05)',
              padding: '10px 28px',
              borderRadius: '12px',
            }}>
              {captchaData.question}
            </div>
            {/* Input row */}
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              <input
                ref={captchaInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCaptchaSubmit()
                }}
                placeholder="输入答案"
                style={{
                  width: '120px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid',
                  borderColor: captchaError ? '#C75050' : 'rgba(0,0,0,0.12)',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.2s, transform 0.2s',
                  transform: captchaError ? 'translateX(-4px)' : 'none',
                  animation: captchaError ? 'captchaShake 0.5s ease' : 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#5A7247'}
                onBlur={e => e.currentTarget.style.borderColor = captchaError ? '#C75050' : 'rgba(0,0,0,0.12)'}
              />
              <button
                onClick={handleCaptchaSubmit}
                disabled={!captchaInput}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: captchaInput ? 'linear-gradient(135deg, #5A7247 0%, #3D4A2E 100%)' : 'rgba(0,0,0,0.08)',
                  color: captchaInput ? 'white' : 'rgba(0,0,0,0.25)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: captchaInput ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                确认
              </button>
            </div>
            {captchaError && (
              <div style={{ color: '#C75050', fontSize: '12px', fontWeight: 500 }}>
                答案不对，再试一次
              </div>
            )}
            <button
              onClick={() => {
                setShowCaptcha(false)
                pendingTextRef.current = ''
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontFamily: 'inherit',
                padding: '4px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#C75050'
                e.currentTarget.style.background = 'rgba(199,80,80,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'none'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
