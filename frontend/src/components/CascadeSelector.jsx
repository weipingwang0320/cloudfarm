import React from 'react'

const SELECT_STYLE = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d0cfc7',
  backgroundColor: '#fff',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: '#3d3929',
  cursor: 'pointer',
  outline: 'none',
  minWidth: '180px',
  transition: 'border-color 0.2s',
}

const LABEL_STYLE = {
  fontSize: '13px',
  color: '#8B7355',
  marginBottom: '6px',
  fontWeight: 600,
}

const GROUP_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

export default function CascadeSelector({
  crops,
  provinces,
  selectedCrop,
  selectedProvince,
  selectedZone,
  onCropChange,
  onProvinceChange,
  onZoneChange,
}) {
  const currentProvince = provinces.find((p) => p.name === selectedProvince)

  const handleProvinceChange = (e) => {
    const name = e.target.value
    onProvinceChange(name)
    onZoneChange('')
  }

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={GROUP_STYLE}>
        <label style={LABEL_STYLE}>🌱 选择作物</label>
        <select
          value={selectedCrop}
          onChange={(e) => onCropChange(e.target.value)}
          style={SELECT_STYLE}
        >
          <option value="">-- 请选择作物 --</option>
          {crops.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.name}（约{c.total_days}天）
            </option>
          ))}
        </select>
      </div>

      <div style={GROUP_STYLE}>
        <label style={LABEL_STYLE}>📍 选择省份</label>
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          style={SELECT_STYLE}
        >
          <option value="">-- 请选择省份 --</option>
          {provinces.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div style={GROUP_STYLE}>
        <label style={LABEL_STYLE}>🌡 选择气候区</label>
        <select
          value={selectedZone}
          onChange={(e) => onZoneChange(e.target.value)}
          style={{
            ...SELECT_STYLE,
            opacity: currentProvince ? 1 : 0.5,
          }}
          disabled={!currentProvince}
        >
          <option value="">-- 请选择气候区 --</option>
          {currentProvince?.zones.map((z) => (
            <option key={z.key} value={z.key}>
              {z.name} — {z.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
