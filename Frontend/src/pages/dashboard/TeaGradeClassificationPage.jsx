import { Award, FlaskConical } from 'lucide-react'
import { useEffect, useState } from 'react'
import Alert from '../../components/ui/Alert'
import QuickActionsCard from '../../components/disease/QuickActionsCard'
import AnalysisTrendChart from '../../components/disease/DiseaseTrendChart'
import GradeInsightsCard from '../../components/grade/GradeInsightsCard'
import GradeResultPanel from '../../components/grade/GradeResultPanel'
import GradeSummaryCard from '../../components/grade/GradeSummaryCard'
import GradeUploadPanel from '../../components/grade/GradeUploadPanel'
import RecentGradeClassificationHistory from '../../components/grade/RecentGradeClassificationHistory'
import SamplePreviewCard from '../../components/disease/SamplePreviewCard'
import { useImageUpload } from '../../hooks/useImageUpload'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'

const MODULE_TYPE = 'tea_grade_classification'

function TeaGradeClassificationPage() {
  const imageUpload = useImageUpload()
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshHistory = async () => {
    const records = await predictionService.listPredictions({ includeImages: true, moduleType: MODULE_TYPE })
    setHistory(records)
  }

  useEffect(() => {
    const timerId = setTimeout(() => refreshHistory().catch(() => {}), 0)
    return () => clearTimeout(timerId)
  }, [])

  const classifyTeaGrade = async () => {
    if (!imageUpload.file) {
      setError('Please upload a tea sample image before grade classification.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      setResult(await modelService.classifyTeaGrade(imageUpload.file))
      await refreshHistory()
    } catch (apiError) {
      setError(apiError.message || 'Classification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const displayedResult = result || history[0]?.result || null
  const removeHistoryRecord = (id) => setHistory((records) => records.filter((record) => record._id !== id))

  return <div className="space-y-3 pb-2"><GradePageHeader /><GradeIntro result={displayedResult} />{error ? <Alert tone="error" message={error} /> : null}<section className="grid gap-3 lg:grid-cols-[1.05fr_1.12fr_1.36fr]"><GradeUploadPanel file={imageUpload.file} isDragging={imageUpload.isDragging} onFileSelect={imageUpload.onFileSelect} dragHandlers={imageUpload.dragHandlers} onAnalyze={classifyTeaGrade} isLoading={isLoading} onClear={imageUpload.clear} /><SamplePreviewCard previewUrl={imageUpload.previewUrl} file={imageUpload.file} title="Tea Sample Preview" previewAlt="Tea grade sample" emptyText="Upload a tea sample to replace the preview." /><GradeResultPanel result={displayedResult} isLoading={isLoading} /></section><section className="grid gap-3 xl:grid-cols-[1.34fr_1fr_1fr]"><section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-extrabold text-[#17231c]">Grade Trend</h2><p className="mt-0.5 text-[11px] text-[#8a968d]">Average confidence from saved classifications</p></div>{displayedResult ? <span className="rounded-full bg-[#087d47] px-2.5 py-1 text-[11px] font-bold !text-white">{formatConfidence(displayedResult.confidence)}%</span> : null}</div><AnalysisTrendChart records={history} /></section><GradeSummaryCard records={history} /><QuickActionsCard /></section><section className="grid gap-3 xl:grid-cols-2"><ProbabilityCard result={displayedResult} /><GradeInsightsCard result={displayedResult} /></section><RecentGradeClassificationHistory records={history} onDeleted={removeHistoryRecord} /></div>
}

function GradePageHeader() {
  return <header className="flex items-center gap-3 px-1 py-1"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#dff3e6] text-[#16764d]"><Award className="h-6 w-6" strokeWidth={1.8} /></span><div><h1 className="text-[27px] font-extrabold tracking-[-0.04em] text-[#103b29]">Tea Grade Classification</h1><p className="text-[12px] text-[#53665a]">Classify tea samples and route each grade with confidence-based AI insights.</p></div></header>
}

function GradeIntro({ result }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e9e3] pb-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#16764d]">Quality intelligence / image model</p><p className="mt-1 text-[11px] text-[#718077]">Supported classes: BM, BOP, BP, Broken Tea, Dust, Fannings, PF and PW Dust.</p></div>{result ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe8d5] bg-[#f0faf2] px-3 py-1.5 text-[10px] font-bold text-[#16764d]"><span className="h-1.5 w-1.5 rounded-full bg-[#15965b]" />Latest result ready</span> : null}</div>
}

function ProbabilityCard({ result }) {
  const rows = result?.probability_table || []
  return <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff3e6] text-[#087d47]"><FlaskConical className="h-4 w-4" /></span><div><h2 className="text-[15px] font-extrabold text-[#17231c]">Class Probability</h2><p className="text-[11px] text-[#8a968d]">Confidence distribution across grade classes</p></div></div><div className="mt-4 overflow-hidden rounded-[10px] border border-[#e2ebe4]"><table className="w-full text-left text-[11px]"><thead className="bg-[#f5f8f5] text-[10px] font-bold uppercase tracking-wide text-[#718077]"><tr><th className="px-3 py-2.5">Class</th><th className="px-3 py-2.5">Probability</th></tr></thead><tbody>{rows.length ? rows.slice(0, 6).map((row) => <ProbabilityRow key={row.label} row={row} />) : <tr><td colSpan="2" className="px-3 py-7 text-center text-[#8a968d]">Probability data will appear after classification.</td></tr>}</tbody></table></div></section>
}

function ProbabilityRow({ row }) {
  const raw = Number(row.probability) || 0
  const percentage = raw <= 1 ? raw * 100 : raw
  return <tr className="border-t border-[#edf1ed]"><td className="px-3 py-2.5 font-semibold uppercase text-[#33483a]">{row.label?.replaceAll('_', ' ')}</td><td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4ece6]"><span className="block h-full rounded-full bg-[#16764d]" style={{ width: `${Math.min(100, percentage)}%` }} /></span><span className="w-12 text-right font-semibold text-[#16764d]">{percentage.toFixed(1)}%</span></div></td></tr>
}

function formatConfidence(value) {
  const confidence = Number(value) || 0
  return (confidence <= 1 ? confidence * 100 : confidence).toFixed(1)
}

export default TeaGradeClassificationPage
