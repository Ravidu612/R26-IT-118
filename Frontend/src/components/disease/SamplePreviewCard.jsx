import { Expand, FileImage } from 'lucide-react'

function SamplePreviewCard({ previewUrl, file, title = 'Sample Preview', emptyText = 'Upload an image to replace the sample preview.', previewAlt = 'Tea sample preview' }) {
  const imageUrl = previewUrl || '/assets/sri-lankan-tea-picker.png'
  const fileSize = file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '—'
  const format = file?.type?.split('/')[1]?.toUpperCase() || 'JPG'

  return <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold text-[#17231c]">{title}</h2><span className="text-[11px] text-[#8a968d]">{file ? 'Selected image' : 'Sample image'}</span></div><div className="relative mt-3 overflow-hidden rounded-[12px] bg-[#edf5ef]"><img src={imageUrl} alt={file ? `Selected ${previewAlt.toLowerCase()}` : previewAlt} className="h-[238px] w-full object-cover" /><button type="button" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#26372c] shadow-sm" aria-label="Expand preview"><Expand className="h-4 w-4" /></button></div><div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-[#53665a]"><Meta label="Resolution" value={file ? 'Image ready' : '—'} /><Meta label="Format" value={format} /><Meta label="Size" value={fileSize} /></div>{!file ? <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#8a968d]"><FileImage className="h-3.5 w-3.5" />{emptyText}</p> : null}</section>
}

function Meta({ label, value }) {
  return <div className="rounded-lg border border-[#e4ece6] bg-[#fbfdfb] px-2 py-2"><span className="block text-[#8a968d]">{label}</span><span className="mt-0.5 block font-semibold text-[#33483a]">{value}</span></div>
}

export default SamplePreviewCard
