import React, { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TimelineView from './TimelineView'

export default function CalendarExport({ timeline, cropName, cropIcon, sowingDate, onClose }) {
  const printRef = useRef(null)

  const handleExport = async () => {
    const element = printRef.current
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FAF8F5',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 16
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text(`${cropName} 生长日历`, 8, 15)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(`播种日期: ${sowingDate}`, 8, 22)
      pdf.text(`生成时间: ${new Date().toLocaleDateString('zh-CN')}`, 8, 28)

      pdf.addImage(imgData, 'PNG', 8, 33, imgWidth, imgHeight)

      // Handle multi-page if content overflows
      let heightLeft = imgHeight - (pdf.internal.pageSize.getHeight() - 40)
      while (heightLeft > 0) {
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 8, -(pdf.internal.pageSize.getHeight() - 40), imgWidth, imgHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      pdf.save(`${cropName}_生长日历_${sowingDate}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF导出失败，请重试')
    }
  }

  if (!timeline) return null

  return (
    <div style={{ position: 'relative' }}>
      {/* Hidden render target for html2canvas */}
      <div
        ref={printRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '700px',
          backgroundColor: '#FAF8F5',
          padding: '20px',
        }}
      >
        <TimelineView timeline={timeline} cropName={cropName} cropIcon={cropIcon} />
      </div>

      <button
        onClick={handleExport}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#5A7247',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4A6037')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5A7247')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        导出 PDF
      </button>
    </div>
  )
}
