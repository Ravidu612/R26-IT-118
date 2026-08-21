import { Camera, CloudUpload, FileImage, Trash2 } from 'lucide-react'

function GradeUploadPanel({ file, isDragging, onFileSelect, dragHandlers, onAnalyze, isLoading, onClear }) {
  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) onFileSelect(selectedFile)
  }

  return (
    <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff3e6] text-[#087d47]"><CloudUpload className="h-4 w-4" /></span>
        <h2 className="text-[15px] font-extrabold text-[#17231c]">Upload Tea Sample</h2>
      </div>
      <p className="mt-2 text-[11px] text-[#718077]">Upload a clear tea sample image for AI grade classification.</p>
      <div {...dragHandlers} className={`mt-3 rounded-[10px] border border-dashed p-5 text-center transition ${isDragging ? 'border-[#16764d] bg-[#eff9f1]' : 'border-[#cfe0d4] bg-[#fcfefd]'}`}>
        <input id="tea-grade-classification-upload" type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <label htmlFor="tea-grade-classification-upload" className="flex cursor-pointer flex-col items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-[#d9eee0] bg-[#eef9f1] text-[#16764d]"><CloudUpload className="h-7 w-7" strokeWidth={1.7} /></span>
          <span className="mt-3 text-[13px] font-bold text-[#26372c]">Drag and drop your tea sample here</span>
          <span className="mt-1 text-[12px] text-[#718077]">or <span className="font-bold text-[#16764d]">browse files</span> from your device</span>
          <span className="mt-2 text-[10px] text-[#8a968d]">PNG / JPG / JPEG · recommended max 10MB</span>
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-[9px] border border-[#e2eae4] bg-[#fbfdfb] px-3 py-2.5">
        <Camera className="h-4 w-4 text-[#16764d]" />
        <span className="text-[11px] font-semibold text-[#53665a]">Camera / file input</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#16764d]"><span className="h-2 w-2 rounded-full bg-[#15965b]" />{file ? 'File ready' : 'Ready'}</span>
        {file ? <button type="button" onClick={onClear} className="rounded-md p-1 text-[#718077] hover:bg-[#edf6ef] hover:text-[#c45a4a]" aria-label="Remove selected sample"><Trash2 className="h-4 w-4" /></button> : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[11px] text-[#718077]"><FileImage className="h-3.5 w-3.5 shrink-0" />{file?.name || 'No sample selected yet'}</span>
        <button type="button" onClick={onAnalyze} disabled={!file || isLoading} className="rounded-lg bg-[#087d47] px-3 py-2 text-[11px] font-bold !text-white transition hover:bg-[#075f37] disabled:cursor-not-allowed disabled:opacity-45">{isLoading ? 'Classifying...' : 'Classify Grade'}</button>
      </div>
    </section>
  )
}

export default GradeUploadPanel
