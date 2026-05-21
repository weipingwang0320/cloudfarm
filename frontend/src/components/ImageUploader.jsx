import React, { useState, useRef } from 'react'

const ZONE_STYLE = {
  border: '2px dashed #d0cfc7',
  borderRadius: '14px',
  padding: '48px 24px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: '#FAF8F5',
  position: 'relative',
  overflow: 'hidden',
}

const PREVIEW_STYLE = {
  maxWidth: '100%',
  maxHeight: '320px',
  borderRadius: '10px',
  objectFit: 'contain',
}

const BTN_STYLE = {
  padding: '8px 20px',
  borderRadius: '8px',
  border: '1px solid #5A7247',
  backgroundColor: '#fff',
  color: '#5A7247',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

export default function ImageUploader({ onImageReady, disabled }) {
  const [preview, setPreview] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      setPreview(result)
      // Extract base64 part after data:image/...;base64,
      const base64 = result.split(',')[1]
      onImageReady(base64, file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    processFile(file)
  }

  const handleClear = () => {
    setPreview(null)
    setFileName('')
    onImageReady('', '')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      {!preview ? (
        <div
          style={{
            ...ZONE_STYLE,
            borderColor: isDragOver ? '#5A7247' : '#d0cfc7',
            backgroundColor: isDragOver ? '#F0F5EB' : '#FAF8F5',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div style={{ marginBottom: '16px' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#A69278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 600, color: '#3d3929', marginBottom: '8px' }}>
            拖拽图片到此处，或点击上传
          </div>
          <div style={{ fontSize: '13px', color: '#A69278', marginBottom: '12px' }}>
            支持 JPG / PNG / WebP，最大 10MB
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={BTN_STYLE}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              选择文件
            </span>
            <span style={BTN_STYLE}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              拍照上传
            </span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <img src={preview} alt="Preview" style={PREVIEW_STYLE} />
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#8B7355' }}>
            {fileName}
          </div>
          <button
            onClick={handleClear}
            disabled={disabled}
            style={{
              ...BTN_STYLE,
              marginTop: '10px',
              color: '#C75050',
              borderColor: '#C75050',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            重新选择
          </button>
        </div>
      )}
    </div>
  )
}
