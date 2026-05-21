import React from 'react'

const GROUP_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const LABEL_ROW_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const LABEL_STYLE = {
  fontSize: '13px',
  color: '#8B7355',
  fontWeight: 600,
}

const VALUE_STYLE = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#3d3929',
  fontFamily: 'monospace',
}

const ROW_STYLE = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
}

const NUMBER_STYLE = {
  width: '72px',
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #d0cfc7',
  fontSize: '14px',
  fontFamily: 'monospace',
  color: '#3d3929',
  textAlign: 'center',
  outline: 'none',
}

export default function SliderInput({ label, unit, min, max, step, value, onChange, icon }) {
  const fillPercent = ((value - min) / (max - min)) * 100

  const handleSliderChange = (e) => {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) onChange(v)
  }

  const handleNumberChange = (e) => {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) {
      const clamped = Math.max(min, Math.min(max, v))
      onChange(clamped)
    }
  }

  return (
    <div style={GROUP_STYLE}>
      <div style={LABEL_ROW_STYLE}>
        <span style={LABEL_STYLE}>
          {icon ? icon + ' ' : ''}{label}
        </span>
        <span style={VALUE_STYLE}>{value} {unit}</span>
      </div>
      <div style={ROW_STYLE}>
        <input
          type="range"
          className="fertilizer-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          style={{ '--fill-percent': fillPercent + '%', flex: 1 }}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleNumberChange}
          style={NUMBER_STYLE}
        />
      </div>
    </div>
  )
}
