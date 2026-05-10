import { ImageUp } from 'lucide-react'

function ImageUpload({ fileName, previewUrl, isDragging, onFileSelect, dragHandlers, inputId = 'image-upload' }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <section className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
        Upload Tea Image
      </label>
      <div
        {...dragHandlers}
        className={[
          'rounded-2xl border border-dashed p-5 transition-colors',
          isDragging ? 'border-teal-300 bg-teal-300/10' : 'border-[var(--border-color)] bg-slate-900/45',
        ].join(' ')}
      >
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
          <div className="rounded-full bg-teal-300/15 p-3">
            <ImageUp className="h-5 w-5 text-teal-200" />
          </div>
          <p className="text-sm font-semibold text-slate-100">Drag and drop an image here or click to browse</p>
          <p className="text-xs text-slate-400">PNG / JPG / JPEG supported, recommended max 10MB</p>
        </label>
      </div>
      <p className="text-sm text-slate-300">{fileName || 'No image selected yet.'}</p>
      {previewUrl ? (
        <img src={previewUrl} alt="Tea upload preview" className="max-h-72 w-full rounded-2xl border border-[var(--border-color)] object-contain" />
      ) : null}
    </section>
  )
}

export default ImageUpload
