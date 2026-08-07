import { ImageUp } from 'lucide-react'

function ImageUpload({ fileName, previewUrl, isDragging, onFileSelect, dragHandlers, inputId = 'image-upload' }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <section className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-bold text-slate-200">
        Upload Tea Image
      </label>
      <div
        {...dragHandlers}
        className={[
          'rounded-[12px] border border-dashed p-0 transition-colors',
          isDragging ? 'border-teal-300 bg-teal-300/10' : 'border-[var(--border-color)] bg-slate-900/45',
        ].join(' ')}
      >
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <label htmlFor={inputId} className="flex cursor-pointer items-center gap-4 p-5 text-left sm:p-6">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-teal-200 bg-white">
            <ImageUp className="h-5 w-5 text-teal-200" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-100">Drop your tea sample here</p>
            <p className="mt-1 text-sm text-slate-300">or <span className="font-semibold text-[var(--tea-green)]">browse files</span> from your device</p>
            <p className="mt-2 text-xs text-slate-400">PNG / JPG / JPEG · recommended max 10MB</p>
          </div>
          <span className="hidden rounded-md border border-[var(--border-color)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--tea-green)] sm:inline-flex">Upload</span>
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3 text-sm">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Selected file</span>
        <span className="truncate text-right text-slate-300">{fileName || 'No image selected yet.'}</span>
      </div>
      {previewUrl ? (
        <div className="border-t border-[var(--border-color)] pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Sample preview</p>
          <img src={previewUrl} alt="Tea upload preview" className="max-h-72 w-full rounded-lg border border-[var(--border-color)] bg-white object-contain" />
        </div>
      ) : null}
    </section>
  )
}

export default ImageUpload
