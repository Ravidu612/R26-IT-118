import { useMemo, useState } from 'react'

export function useImageUpload() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const onFileSelect = (selectedFile) => {
    if (!selectedFile?.type?.startsWith('image/')) return
    setFile(selectedFile)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const selectedFile = event.dataTransfer.files?.[0]
    onFileSelect(selectedFile)
  }

  const dragHandlers = {
    onDragOver: (event) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: () => setIsDragging(false),
    onDrop,
  }

  return {
    file,
    previewUrl,
    isDragging,
    setFile,
    onFileSelect,
    dragHandlers,
    clear: () => setFile(null),
  }
}
