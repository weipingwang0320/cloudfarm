import React from 'react'

const CARD_STYLE = {
  backgroundColor: '#fff',
  borderRadius: '14px',
  padding: '24px 28px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
}

const HEADER_ROW = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
  flexWrap: 'wrap',
  gap: '12px',
}

const DISEASE_NAME = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#3d3929',
}

const CONFIDENCE_BADGE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 700,
}

const SECTION_TITLE = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#8B7355',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const SECTION_TEXT = {
  fontSize: '14px',
  color: '#5D4E37',
  lineHeight: '1.7',
  marginBottom: '16px',
}

const REC_LIST = {
  fontSize: '14px',
  color: '#5D4E37',
  lineHeight: '1.8',
  paddingLeft: '20px',
  margin: 0,
}

export default function ResultCard({ result }) {
  if (!result) return null

  const isHealthy = result.disease_name === '健康'
  const confidencePct = Math.round(result.confidence * 100)

  let confColor = '#5A7247'
  let confBg = '#F0F5EB'
  if (result.confidence < 0.5) {
    confColor = '#C75050'
    confBg = '#FFF0F0'
  } else if (result.confidence < 0.75) {
    confColor = '#DAA520'
    confBg = '#FFF8E8'
  }

  const recommendations = result.recommendation
    ? result.recommendation.split(/\d+\.\s*/).filter(Boolean)
    : []

  return (
    <div style={CARD_STYLE}>
      <div style={HEADER_ROW}>
        <div>
          <div style={DISEASE_NAME}>
            {isHealthy ? '✅ ' : '🔬 '}{result.disease_name}
          </div>
        </div>
        <span style={{
          ...CONFIDENCE_BADGE,
          backgroundColor: confBg,
          color: confColor,
        }}>
          置信度 {confidencePct}%
        </span>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          height: '6px',
          backgroundColor: '#E8E4D9',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${confidencePct}%`,
            backgroundColor: confColor,
            borderRadius: '3px',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Description */}
      {result.description && (
        <>
          <div style={SECTION_TITLE}>📋 病害描述</div>
          <div style={SECTION_TEXT}>{result.description}</div>
        </>
      )}

      {/* Recommendation */}
      {recommendations.length > 0 && (
        <>
          <div style={SECTION_TITLE}>💊 防治方案</div>
          <ul style={REC_LIST}>
            {recommendations.map((r, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{r.trim()}</li>
            ))}
          </ul>
        </>
      )}

      {result.confidence < 0.5 && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#FFF8E8',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#8B7355',
          lineHeight: '1.6',
        }}>
          ⚠ 置信度较低，建议重新拍摄清晰图片或咨询专业农技人员
        </div>
      )}
    </div>
  )
}
