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
  { type: 'tomato', name: '番茄', icon: '🍅', color: '#ff6b6b' },
  { type: 'strawberry', name: '草莓', icon: '🍓', color: '#ff4757' },
  { type: 'corn', name: '玉米', icon: '🌽', color: '#f9ca24' },
  { type: 'rice', name: '水稻', icon: '🌾', color: '#4caf50' },
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
    healthScore: 100,
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
      content: `🌱 第1天：种子被种进了温暖的土壤中！即将开始一场奇妙的生长之旅...`,
      health: 100,
    }
    setCropState({
      cropType,
      stage: 0,
      stageName: '播种期',
      healthScore: 100,
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
        current_health: state.healthScore,
        temp_max: currentWeather.temp_max,
        temp_min: currentWeather.temp_min,
        precipitation: currentWeather.precipitation || 0,
        sunshine_hours: currentWeather.sunshine_hours || 8,
        user_care: Math.random() * 2,
      })

      if (res.data.success) {
        const data = res.data.data
        const newDay = state.dayNumber + 1
        const newCropState = {
          ...state,
          stage: data.stage,
          stageName: data.stage_name,
          healthScore: data.health_score,
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
            health_score: data.health_score,
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
              health: data.health_score,
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
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, display: 'flex', gap: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FarmScene
              weatherEffect={weatherEffect}
              activePlotNum={activePlotNum}
              cropState={hasStarted ? cropState : null}
              onPlotClick={handlePlotClick}
              selectedPlot={selectedPlot}
            />
          </div>

          <div style={{
            width: 340,
            background: 'white',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8ece8' }}>
              <WeatherPanel weather={weather} forecast={forecast} />
            </div>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8ece8' }}>
              <SensorPanel sensor={sensor} />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 10px' }}>
              <DiaryPanel entries={diaryEntries} />
            </div>
          </div>
        </div>

        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ flex: 1, maxWidth: 600 }}>
            <TimeAccelerator
              isRunning={isRunning}
              onToggleRun={() => setIsRunning(prev => !prev)}
              onBatchSimulate={batchSimulate}
              dayNumber={cropState.dayNumber}
              disabled={!hasStarted || isBusy}
            />
          </div>

          {hasStarted && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowCropInfo(true)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                📊 作物详情
              </button>
              {isBusy && (
                <span style={{ fontSize: 12, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
                  推进中...
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowChat(true)}
        style={{
          position: 'fixed', bottom: 80, right: 370, zIndex: 10,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          border: 'none', fontSize: 24, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(76,175,80,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        title="AI农场管家"
      >
        🤖
      </button>

      {showPlantModal && (
        <div className="modal-overlay" onClick={() => { setShowPlantModal(false); setActivePlotNum(null) }}>
          <div className="modal-content slide-up" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ fontSize: 20, marginBottom: 16 }}>
              🌱 选择要种植的作物
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: 14, marginBottom: 20 }}>
              选择一个地块（#{activePlotNum}号）开始你的田园生活
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CROP_OPTIONS.map(({ type, name, icon, color }) => (
                <button
                  key={type}
                  onClick={() => handleStartPlanting(type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', border: `2px solid ${color}22`,
                    borderRadius: 12, background: `${color}08`,
                    cursor: 'pointer', fontSize: 15, fontWeight: 600,
                    color: '#333', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${color}15`
                    e.currentTarget.style.borderColor = `${color}44`
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `${color}08`
                    e.currentTarget.style.borderColor = `${color}22`
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 400, marginTop: 2 }}>
                      {type === 'tomato' ? '经典易种' : type === 'strawberry' ? '甜美多汁' : type === 'corn' ? '金黄饱满' : '水乡之选'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={() => { setShowPlantModal(false); setActivePlotNum(null) }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showCropInfo && hasStarted && (
        <div className="modal-overlay" onClick={() => setShowCropInfo(false)}>
          <div className="modal-content slide-up" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <CropInfo cropState={cropState} />
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={() => setShowCropInfo(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {showChat && (
        <ChatBot
          cropState={cropState}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}