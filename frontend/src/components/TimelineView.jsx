import React, { forwardRef } from 'react'
import TimelineCard from './TimelineCard'

const LINE_COLOR = '#d0cfc7'
const DOT_SIZE = 12

export default forwardRef(function TimelineView({ timeline, cropName, cropIcon }, ref) {
  if (!timeline || timeline.length === 0) return null

  return (
    <div ref={ref} style={{ padding: '10px 0' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>{cropIcon}</span>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#3d3929', margin: '6px 0 0' }}>
          {cropName} 生长日历
        </h2>
      </div>

      <div style={{ position: 'relative', paddingLeft: '28px' }}>
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: '5px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            backgroundColor: LINE_COLOR,
          }}
        />

        {timeline.map((stage, i) => (
          <div key={stage.order} style={{ position: 'relative', marginBottom: i < timeline.length - 1 ? '16px' : '0' }}>
            {/* Dot on the line */}
            <div
              style={{
                position: 'absolute',
                left: '-28px',
                top: '20px',
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: '50%',
                backgroundColor: stage.color || '#5A7247',
                border: '2px solid #fff',
                boxShadow: '0 0 0 2px ' + (stage.color || '#5A7247'),
                zIndex: 1,
              }}
            />

            <TimelineCard stage={stage} isLast={i === timeline.length - 1} />
          </div>
        ))}
      </div>
    </div>
  )
})
