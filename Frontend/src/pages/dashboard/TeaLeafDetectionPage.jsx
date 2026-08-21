import { Bug, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'
import AnalysisSummaryCard from '../../components/disease/AnalysisSummaryCard'
import DiseaseResultPanel from '../../components/disease/DiseaseResultPanel'
import DiseaseTrendChart from '../../components/disease/DiseaseTrendChart'
import DiseaseUploadPanel from '../../components/disease/DiseaseUploadPanel'
import LeafDetectionResultPanel from '../../components/disease/LeafDetectionResultPanel'
import LeafDetectionSummaryCard from '../../components/disease/LeafDetectionSummaryCard'
import QuickActionsCard from '../../components/disease/QuickActionsCard'
import RecentLeafDetectionHistory from '../../components/disease/RecentLeafDetectionHistory'
import RecentDetectionHistory from '../../components/disease/RecentDetectionHistory'
import SamplePreviewCard from '../../components/disease/SamplePreviewCard'
import Alert from '../../components/ui/Alert'
import { useImageUpload } from '../../hooks/useImageUpload'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'

function TeaLeafDetectionPage() {
  const imageUpload = useImageUpload()
  const [activeTab, setActiveTab] = useState('disease')
  const [diseaseResult, setDiseaseResult] = useState(null)
  const [leafResult, setLeafResult] = useState(null)
  const [diseaseHistory, setDiseaseHistory] = useState([])
  const [leafHistory, setLeafHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshHistory = async () => {
    const [diseaseRecords, leafRecords] = await Promise.all([
      predictionService.listPredictions({ includeImages: true, moduleType: 'tea_leaf_disease_detection' }),
      predictionService.listPredictions({ includeImages: true, moduleType: 'tea_leaf_detection' }),
    ])
    setDiseaseHistory(diseaseRecords)
    setLeafHistory(leafRecords)
  }

  useEffect(() => {
    const timerId = setTimeout(() => refreshHistory().catch(() => {}), 0)
    return () => clearTimeout(timerId)
  }, [])

  const detectDisease = async () => {
    if (!imageUpload.file) {
      setError('Please upload a tea leaf image before disease detection.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const result = await modelService.detectTeaLeafDisease(imageUpload.file)
      setDiseaseResult(result)
      await refreshHistory()
    } catch (apiError) {
      setError(apiError.message || 'Disease detection failed')
    } finally {
      setIsLoading(false)
    }
  }

  const detectLeaf = async () => {
    if (!imageUpload.file) {
      setError('Please upload a tea leaf image before leaf detection.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const result = await modelService.detectTeaLeaf(imageUpload.file)
      setLeafResult(result)
      await refreshHistory()
    } catch (apiError) {
      setError(apiError.message || 'Tea leaf detection failed')
    } finally {
      setIsLoading(false)
    }
  }

  const isLeafTab = activeTab === 'leaf'
  const records = isLeafTab ? leafHistory : diseaseHistory
  const displayedResult = isLeafTab ? leafResult || leafHistory[0]?.result || null : diseaseResult || diseaseHistory[0]?.result || null
  const analyze = isLeafTab ? detectLeaf : detectDisease
  const removeHistoryRecord = (id) => {
    setDiseaseHistory((current) => current.filter((record) => record._id !== id))
    setLeafHistory((current) => current.filter((record) => record._id !== id))
  }

  return (
    <div className="space-y-3 pb-2">
      <AnalysisPageHeader />
      <AnalysisTabs activeTab={activeTab} onChange={setActiveTab} />
      {error ? <Alert tone="error" message={error} /> : null}
      <section className="grid gap-3 lg:grid-cols-[1.05fr_1.12fr_1.36fr]">
        <DiseaseUploadPanel file={imageUpload.file} isDragging={imageUpload.isDragging} onFileSelect={imageUpload.onFileSelect} dragHandlers={imageUpload.dragHandlers} onAnalyze={analyze} isLoading={isLoading} onClear={imageUpload.clear} analysisType={activeTab} />
        <SamplePreviewCard previewUrl={imageUpload.previewUrl} file={imageUpload.file} />
        {isLeafTab ? <LeafDetectionResultPanel result={displayedResult} /> : <DiseaseResultPanel result={displayedResult} />}
      </section>
      <section className="grid gap-3 lg:grid-cols-[1.34fr_1fr_1fr]">
        <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-extrabold text-[#17231c]">{isLeafTab ? 'Detection Trend' : 'Disease Trend'}</h2><p className="mt-0.5 text-[11px] text-[#8a968d]">Average confidence from saved analyses</p></div>{displayedResult ? <span className="rounded-full bg-[#087d47] px-2.5 py-1 text-[11px] font-bold !text-white">{(Number(displayedResult.confidence || 0) * 100).toFixed(1)}%</span> : null}</div><DiseaseTrendChart records={records} /></section>
        {isLeafTab ? <LeafDetectionSummaryCard records={leafHistory} /> : <AnalysisSummaryCard records={diseaseHistory} />}
        <QuickActionsCard />
      </section>
      {isLeafTab ? <RecentLeafDetectionHistory records={leafHistory} onDeleted={removeHistoryRecord} /> : <RecentDetectionHistory records={diseaseHistory} onDeleted={removeHistoryRecord} />}
    </div>
  )
}

function AnalysisPageHeader() {
  return <header className="flex items-center gap-3 px-1 py-1"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#dff3e6] text-[#16764d]"><Leaf className="h-6 w-6" strokeWidth={1.8} /></span><div><h1 className="text-[27px] font-extrabold tracking-[-0.04em] text-[#103b29]">Tea Leaf Analysis</h1><p className="text-[12px] text-[#53665a]">Analyze tea leaves and identify disease classes with advanced AI models.</p></div></header>
}

function AnalysisTabs({ activeTab, onChange }) {
  return <div className="inline-flex rounded-[10px] border border-[#e0e9e2] bg-white p-1 shadow-[0_3px_10px_rgba(33,61,45,.035)]"><TabButton active={activeTab === 'leaf'} onClick={() => onChange('leaf')} icon={Leaf}>Leaf Detection</TabButton><TabButton active={activeTab === 'disease'} onClick={() => onChange('disease')} icon={Bug}>Disease Detection</TabButton></div>
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-[12px] font-bold transition ${active ? 'bg-[#087d47] !text-white shadow-sm' : 'text-[#53665a] hover:bg-[#f1f8f3]'}`}><Icon className="h-4 w-4" />{children}</button>
}

export default TeaLeafDetectionPage
