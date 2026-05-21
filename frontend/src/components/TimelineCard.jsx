import React from 'react'

const CARD_STYLE = {
  position: 'relative',
  padding: '18px 20px 18px 24px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  borderLeft: '4px solid #5A7247',
  transition: 'box-shadow 0.2s, transform 0.2s',
}

const DATE_STYLE = {
  fontSize: '13px',
  color: '#8B7355',
  fontFamily: 'monospace',
}

const NAME_STYLE = {
  fontSize: '17px',
  fontWeight: 700,
  color: '#3d3929',
  marginBottom: '2px',
}

const NAME_EN_STYLE = {
  fontSize: '12px',
  color: '#A69278',
  marginBottom: '8px',
}

const DESC_STYLE = {
  fontSize: '13px',
  color: '#5D4E37',
  lineHeight: '1.5',
}

const BADGE_STYLE = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600,
  backgroundColor: '#F0EDE5',
  color: '#8B7355',
}

const NOTE_STYLE = {
  fontSize: '12px',
  color: '#5A7247',
  marginTop: '8px',
  padding: '6px 10px',
  backgroundColor: '#F0F5EB',
  borderRadius: '6px',
}

const WARNING_STYLE = {
  fontSize: '12px',
  color: '#C75050',
  marginTop: '8px',
  padding: '6px 10px',
  backgroundColor: '#FFF0F0',
  borderRadius: '6px',
}

export default function TimelineCard({ stage, isLast }) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        borderLeftColor: stage.color || '#5A7247',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={NAME_STYLE}>{stage.name}</div>
          <div style={NAME_EN_STYLE}>{stage.name_en}</div>
        </div>
        <span style={BADGE_STYLE}>{stage.duration_days}天</span>
      </div>

      <div style={{ marginTop: '6px' }}>
        <span style={DATE_STYLE}>
          {stage.start_date} → {stage.end_date}
        </span>
      </div>

      <div style={{ marginTop: '8px' }}>
        <span style={DESC_STYLE}>{stage.description}</span>
      </div>

      {stage.notes?.map((note, i) => (
        <div key={i} style={NOTE_STYLE}>
          📅 {note}
        </div>
      ))}

      {stage.risk_warning && (
        <div style={WARNING_STYLE}>
          ⚠ {stage.risk_warning}
        </div>
      )}
    </div>
  )
}
