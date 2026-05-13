import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import FarmScene from '../components/FarmScene'
import WeatherPanel from '../components/WeatherPanel'
import SensorPanel from '../components/SensorPanel'
import DiaryPanel from '../components/DiaryPanel'
import TimeAccelerator from '../components/TimeAccelerator'
import ChatBot from '../components/ChatBot'
import CropInfo from '../components/CropInfo'

const API_BASE = '/api'

const CROP_OPTIONS = [
  { type: 'tomato', name: '番茄', icon: '🍅', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', color: '#C75050' },
  { type: 'strawberry', name: '草莓', icon: '🍓', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&q=80', color: '#E85A5A' },
  { type: 'corn', name: '玉米', icon: '🌽', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80', color: '#DAA520' },
  { type: 'rice', name: '水稻', icon: '🌾', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&q=80', color: '#5A7247' },
]

export default function FarmPage() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [sensor, setSensor] = useState(null)
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [showCropInfo, setShowCropInfo] = useState(false)
  const [showPlantModal, setShowPlantModal] = useState(false)
  const [activePlotNum, setActivePlotNum] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [cropState, setCropState] = useState({
    cropType: 'tomato',
    stage: 0,
    stageName: '播种期',
    height: 0,
    accumulatedGdd: 0,
    dayNumber: 1,
  })
  const [isRunning, setIsRunning] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [diaryEntries, setDiaryEntries] = useState([])
  const [weatherEffect, setWeatherEffect] = useState('clear')
  const weekDataRef = useRef({ rainDays: 0, sunnyDays: 0, tempSum: 0, tempCount: 0, lastDiaryDay: 1 })
  const cropStateRef = useRef(cropState)
  const diaryIdRef = useRef(0)
  const weatherRef = useRef(weather)

  useEffect(() => {
    cropStateRef.current = cropState
  }, [cropState])

  useEffect(() => {
    weatherRef.current = weather
  }, [weather])

  useEffect(() => {
    fetchWeather()
    fetchSensor()
    const wInterval = setInterval(fetchWeather, 60000)
    const sInterval = setInterval(fetchSensor, 600000)
    return () => {
      clearInterval(wInterval)
      clearInterval(sInterval)
    }
  }, [])

  useEffect(() => {
    if (weather) {
      const precip = weather.precipitation || 0
      const sunshine = weather.sunshine_hours || 8
      if (precip > 5) setWeatherEffect('rainy')
      else if (precip > 0) setWeatherEffect('cloudy')
      else if (sunshine > 6) setWeatherEffect('clear')
      else setWeatherEffect('cloudy')
    }
  }, [weather])

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${API_BASE}/weather/forecast?days=3`)
      if (res.data.success) {
        setWeather(res.data.data[0])
        setForecast(res.data.data)
      }
    } catch (e) {}
  }

  const fetchSensor = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sensors/current`)
      if (res.data.success) setSensor(res.data.data.data)
    } catch (e) {}
  }

  const handlePlotClick = useCallback((plot) => {
    if (plot.status === 'adopted') {
      setSelectedPlot(plot)
      setShowCropInfo(true)
    } else if (!hasStarted) {
      setActivePlotNum(plot.num)
      setShowPlantModal(true)
    }
  }, [hasStarted])

  const handleStartPlanting = useCallback((cropType) => {
    const initialDiary = {
      id: ++diaryIdRef.current,
      day: 1,
      week: 1,
      stage: '播种期',
      content: `第1天：种子被种进了温暖的土壤中，即将开始一场奇妙的生长之旅...`,
    }
    setCropState({
      cropType,
      stage: 0,
      stageName: '播种期',
      height: 0,
      accumulatedGdd: 0,
      dayNumber: 1,
    })
    setDiaryEntries([initialDiary])
    weekDataRef.current = { rainDays: 0, sunnyDays: 0, tempSum: 0, tempCount: 0, lastDiaryDay: 1 }
    setHasStarted(true)
    setShowPlantModal(false)
  }, [])

  const simulateDay = useCallback(async () => {
    const currentWeather = weatherRef.current
    if (!currentWeather) return null
    const state = cropStateRef.current
    if (!state) return null

    try {
      const res = await axios.post(`${API_BASE}/crops/simulate`, {
        crop_type: state.cropType,
        accumulated_gdd: state.accumulatedGdd,
        temp_max: currentWeather.temp_max,
        temp_min: currentWeather.temp_min,
        precipitation: currentWeather.precipitation || 0,
        sunshine_hours: currentWeather.sunshine_hours || 8,
      })

      if (res.data.success) {
        const data = res.data.data
        const newDay = state.dayNumber + 1
        const newCropState = {
          ...state,
          stage: data.stage,
          stageName: data.stage_name,
          height: data.height,
          accumulatedGdd: data.accumulated_gdd,
          dayNumber: newDay,
        }
        setCropState(newCropState)
        cropStateRef.current = newCropState

        const wd = weekDataRef.current
        if ((currentWeather.precipitation || 0) > 0) wd.rainDays++
        else wd.sunnyDays++
        wd.tempSum += (currentWeather.temp_max || 0) + (currentWeather.temp_min || 0)
        wd.tempCount += 2

        const isWeekly = newDay % 7 === 0
        if (isWeekly) {
          const weekNum = Math.floor(newDay / 7)
          const weekAvgTemp = wd.tempCount > 0 ? (wd.tempSum / wd.tempCount) : null

          const diaryRes = await axios.post(`${API_BASE}/diary/weekly`, {
            stage: data.stage,
            style: 'cute',
            crop_type: state.cropType,
            day_number: newDay,
            week_num: weekNum,
            weather_summary: currentWeather.weather_desc || '天气晴好',
            temp_max: currentWeather.temp_max,
            temp_min: currentWeather.temp_min,
            week_avg_temp: weekAvgTemp,
            week_rain_days: wd.rainDays,
            week_sunny_days: wd.sunnyDays,
          })

          wd.rainDays = 0
          wd.sunnyDays = 0
          wd.tempSum = 0
          wd.tempCount = 0
          wd.lastDiaryDay = newDay

          if (diaryRes.data.success) {
            return {
              id: ++diaryIdRef.current,
              day: newDay,
              week: weekNum,
              stage: data.stage_name,
              content: diaryRes.data.data.content,
            }
          }
        }
      }
    } catch (e) {}
    return null
  }, [])

  const batchSimulate = useCallback(async (days) => {
    setIsBusy(true)
    const newDiaries = []
    for (let i = 0; i < days; i++) {
      const diary = await simulateDay()
      if (diary) newDiaries.push(diary)
    }
    if (newDiaries.length > 0) {
      setDiaryEntries(prev => [...prev, ...newDiaries])
    }
    setIsBusy(false)
  }, [simulateDay])

  useEffect(() => {
    if (isRunning && weather && !isBusy && hasStarted) {
      const interval = setInterval(async () => {
        const diary = await simulateDay()
        if (diary) {
          setDiaryEntries(prev => [...prev, diary])
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isRunning, isBusy, hasStarted, simulateDay])

  return (
    <div style={{
      height: 'calc(100vh - 72px)',
      display: 'flex',
      position: 'relative',
      background: 'var(--rice-white)',
    }}>
      {/* 主区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 农场场景 + 侧边栏 */}
        <div style={{ flex: 1, display: 'flex', gap: 0 }}>
          {/* 农场场景 */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <FarmScene
              weatherEffect={weatherEffect}
              activePlotNum={activePlotNum}
              cropState={hasStarted ? cropState : null}
              onPlotClick={handlePlotClick}
              selectedPlot={selectedPlot}
            />

            {/* 浮动状态卡片 */}
            {hasStarted && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: 'var(--shadow-medium)',
                border: '1px solid var(--border-light)',
                minWidth: '200px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: `linear-gradient(135deg, ${CROP_OPTIONS.find(c => c.type === cropState.cropType)?.color || 'var(--primary)'}22 0%, ${CROP_OPTIONS.find(c => c.type === cropState.cropType)?.color || 'var(--primary)'}11 100%)`,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {CROP_OPTIONS.find(c => c.type === cropState.cropType)?.icon || '🌱'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--earth-dark)' }}>
                      {CROP_OPTIONS.find(c => c.type === cropState.cropType)?.name || '作物'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cropState.stageName}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>生长天数</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--earth-dark)' }}>第 {cropState.dayNumber} 天</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>株高</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--earth-dark)' }}>{cropState.height} cm</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>积温</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--earth-dark)' }}>{cropState.accumulatedGdd?.toFixed(0) || 0} °C·d</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧信息面板 */}
          <div style={{
            width: '360px',
            background: 'white',
            borderLeft: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* 天气面板 */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-light)',
              background: 'linear-gradient(180deg, rgba(135,206,235,0.05) 0%, transparent 100%)',
            }}>
              <WeatherPanel weather={weather} forecast={forecast} />
            </div>

            {/* 传感器面板 */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <SensorPanel sensor={sensor} />
            </div>

            {/* 日记面板 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              <DiaryPanel entries={diaryEntries} />
            </div>
          </div>
        </div>

        {/* 底部控制栏 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-light)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{ flex: 1, maxWidth: '600px' }}>
            <TimeAccelerator
              isRunning={isRunning}
              onToggleRun={() => setIsRunning(prev => !prev)}
              onBatchSimulate={batchSimulate}
              dayNumber={cropState.dayNumber}
              disabled={!hasStarted || isBusy}
            />
          </div>

          {hasStarted && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setShowCropInfo(true)}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                作物详情
              </button>
              {isBusy && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--border-light)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  推进中...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI 助手按钮 */}
      <button
        onClick={() => setShowChat(true)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '384px',
          zIndex: 10,
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(90,114,71,0.35)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(90,114,71,0.45)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(90,114,71,0.35)'
        }}
        title="农场助手"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1"/>
          <circle cx="12" cy="10" r="1"/>
          <circle cx="15" cy="10" r="1"/>
        </svg>
      </button>

      {/* 种植选择弹窗 */}
      {showPlantModal && (
        <div className="modal-overlay" onClick={() => { setShowPlantModal(false); setActivePlotNum(null) }}>
          <div
            className="modal-content slide-up"
            style={{ maxWidth: '520px', padding: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 头部图片 */}
            <div style={{
              height: '160px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--grass-green) 100%)',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }} />
              <div style={{ textAlign: 'center', color: 'white', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌱</div>
                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>选择你的作物</h2>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              <p style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                fontSize: '15px',
              }}>
                在 #{activePlotNum} 号地块种下你的第一颗种子
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {CROP_OPTIONS.map(({ type, name, icon, image, color }) => (
                  <button
                    key={type}
                    onClick={() => handleStartPlanting(type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      border: '2px solid var(--border-light)',
                      borderRadius: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color
                      e.currentTarget.style.background = `${color}08`
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      background: `${color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '17px', color: 'var(--earth-dark)' }}>{name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {type === 'tomato' && '红润饱满，经典之选'}
                        {type === 'strawberry' && '甜美多汁，草莓爱好者的最爱'}
                        {type === 'corn' && '金黄颗粒，丰收的象征'}
                        {type === 'rice' && '稻香四溢，水乡之选'}
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>

              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
                onClick={() => { setShowPlantModal(false); setActivePlotNum(null) }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 作物详情弹窗 */}
      {showCropInfo && hasStarted && (
        <div className="modal-overlay" onClick={() => setShowCropInfo(false)}>
          <div className="modal-content slide-up" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <CropInfo cropState={cropState} />
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
              onClick={() => setShowCropInfo(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 聊天助手 */}
      {showChat && (
        <ChatBot
          cropState={cropState}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
