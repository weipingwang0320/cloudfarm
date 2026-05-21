import React from 'react'

const PANEL_STYLE = {
  backgroundColor: '#fff',
  borderRadius: '14px',
  padding: '24px 28px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
}

const SECTION_TITLE = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#5A7247',
  marginBottom: '14px',
  paddingBottom: '8px',
  borderBottom: '2px solid #F0EDE5',
}

const ROW_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #F5F1E8',
}

const LABEL_STYLE = {
  fontSize: '14px',
  color: '#5D4E37',
}

const VALUE_STYLE = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#3d3929',
  fontFamily: 'monospace',
}

const UNIT_STYLE = {
  fontSize: '12px',
  color: '#A69278',
  fontWeight: 400,
}

const SUB_LABEL = {
  fontSize: '13px',
  color: '#8B7355',
}

export default function ResultTable({ result }) {
  if (!result) return null

  const { nutrients, products, micronutrient, input } = result

  return (
    <div style={PANEL_STYLE}>
      <div style={SECTION_TITLE}>养分计算结果</div>

      <div style={ROW_STYLE}>
        <span style={LABEL_STYLE}>氮 (N)</span>
        <span style={VALUE_STYLE}>{nutrients.N} <span style={UNIT_STYLE}>kg/ha</span></span>
      </div>
      <div style={ROW_STYLE}>
        <span style={LABEL_STYLE}>磷 (P₂O₅)</span>
        <span style={VALUE_STYLE}>{nutrients.P2O5} <span style={UNIT_STYLE}>kg/ha</span></span>
      </div>
      <div style={ROW_STYLE}>
        <span style={LABEL_STYLE}>钾 (K₂O)</span>
        <span style={VALUE_STYLE}>{nutrients.K2O} <span style={UNIT_STYLE}>kg/ha</span></span>
      </div>

      <div style={{ ...SECTION_TITLE, marginTop: '20px' }}>折合商品肥料</div>

      <div style={ROW_STYLE}>
        <span style={SUB_LABEL}>尿素 (46% N)</span>
        <span style={VALUE_STYLE}>{products.urea} <span style={UNIT_STYLE}>kg/ha</span></span>
      </div>
      <div style={ROW_STYLE}>
        <span style={SUB_LABEL}>磷酸二铵 DAP (18-46-0)</span>
        <span style={VALUE_STYLE}>{products.dap} <span style={UNIT_STYLE}>kg/ha</span></span>
      </div>
      <div style={ROW_STYLE}>
        <span style={SUB_LABEL}>氯化钾 MOP (60% K₂O)</span>
        <span style={VALUE_STYLE}>{products.mop} <span style={UNIT_STYLE}>kg/ha</span></span>
      </div>

      {(micronutrient.ZnSO4 > 0 || micronutrient.Borax > 0) && (
        <>
          <div style={{ ...SECTION_TITLE, marginTop: '20px' }}>微量元素</div>
          {micronutrient.ZnSO4 > 0 && (
            <div style={ROW_STYLE}>
              <span style={SUB_LABEL}>硫酸锌 (ZnSO₄·7H₂O)</span>
              <span style={VALUE_STYLE}>{micronutrient.ZnSO4} <span style={UNIT_STYLE}>kg/ha</span></span>
            </div>
          )}
          {micronutrient.Borax > 0 && (
            <div style={ROW_STYLE}>
              <span style={SUB_LABEL}>硼砂 (Na₂B₄O₇·10H₂O)</span>
              <span style={VALUE_STYLE}>{micronutrient.Borax} <span style={UNIT_STYLE}>kg/ha</span></span>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '16px', padding: '10px 12px', backgroundColor: '#FAF8F5', borderRadius: '8px', fontSize: '12px', color: '#A69278', lineHeight: '1.6' }}>
        * 以上为纯养分推荐量，实际施用时请结合当地土壤状况和品种特性适当调整。
        肥料分次施用可提高利用率。有机质含量较高（{'>'}3%）时锌肥可适当减量。
      </div>
    </div>
  )
}
