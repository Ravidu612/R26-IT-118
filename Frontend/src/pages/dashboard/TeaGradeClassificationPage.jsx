import { ArrowUpRight, CheckCircle2, FlaskConical, Layers3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ImageUpload from '../../components/models/ImageUpload'
import ProbabilityTable from '../../components/models/ProbabilityTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import PageHeader from '../../components/ui/PageHeader'
import { teaGradeDescriptions, teaGradeRecommendations } from '../../constants/teaGrades'
import { useImageUpload } from '../../hooks/useImageUpload'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'

function ConfidenceBar({ value }) {
  const percentage = Math.max(0, Math.min(value, 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <span>Model confidence</span>
        <span className="text-[var(--tea-green)]">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden bg-[#e7f0e9]">
        <div className="h-full bg-[var(--tea-green)] transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function InsightBlock({ label, children }) {
  return (
    <div className="border-l-2 border-[#8cc69d] pl-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--tea-green)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{children}</p>
    </div>
  )
}

function TeaGradeClassificationPage() {
  const imageUpload = useImageUpload()
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshHistory = async () => {
    const all = await predictionService.listPredictions()
    setHistory(all.filter((item) => item.moduleType === 'tea_grade_classification').slice(0, 8))
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      refreshHistory().catch(() => {})
    }, 0)
    return () => clearTimeout(timerId)
  }, [])

  const classifyTeaGrade = async () => {
    if (!imageUpload.file) {
      setError('Please upload an image before grade classification.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const output = await modelService.classifyTeaGrade(imageUpload.file)
      setResult(output)
      await refreshHistory()
    } catch (apiError) {
      setError(apiError.message || 'Classification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const rows = useMemo(
    () =>
      history.map((item) => ({
        id: item._id,
        date: new Date(item.createdAt).toLocaleString(),
        grade: item.result?.predicted_grade || '-',
        confidence: item.result?.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : '-',
        status: item.result?.statusMessage || 'Completed',
      })),
    [history],
  )

  const grade = result?.predicted_grade || '-'
  const gradeDescription = result?.grade_description || teaGradeDescriptions[grade] || '-'
  const recommendation = result?.recommendation || teaGradeRecommendations[grade] || '-'
  const confidence = Number(result?.confidence) || 0
  const confidencePercent = confidence <= 1 ? confidence * 100 : confidence

  return (
    <div className="space-y-6">
      <PageHeader title="Tea Grade Classification" description="Classify black tea powder grades and review confidence-based recommendations." />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--tea-green)]">Quality intelligence / image model</p>
          <p className="mt-1 text-sm text-slate-400">Upload a representative sample to create a traceable grade decision.</p>
        </div>
        {result ? <Badge tone="success">Latest result ready</Badge> : null}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <Card title="Upload for Classification" subtitle="Supports BM, BOP, BP, BROKEN_TEA, DUST, FANNING_2, PF, and PW_DUST.">
          <ImageUpload
            fileName={imageUpload.file?.name}
            previewUrl={imageUpload.previewUrl}
            isDragging={imageUpload.isDragging}
            onFileSelect={imageUpload.onFileSelect}
            dragHandlers={imageUpload.dragHandlers}
            inputId="tea-grade-classification-upload"
          />
          {error ? <Alert tone="error" message={error} /> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button icon={FlaskConical} onClick={classifyTeaGrade} isLoading={isLoading}>
              Classify Tea Grade
            </Button>
            <Button variant="outline" onClick={imageUpload.clear}>
              Clear Image
            </Button>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-[var(--border-color)] pt-4 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-[var(--tea-green)]" />
            <span>Secure model workflow · image is sent through the backend prediction service.</span>
          </div>
        </Card>
        <Card title="Classification Result" subtitle="Predicted grade and confidence.">
          {isLoading ? <Loader text="Classifying tea grade..." /> : null}
          {!isLoading && !result ? <EmptyState icon={Layers3} title="No grade prediction yet" description="Upload a sample and run classification to view results." /> : null}
          {result ? (
            <div className="space-y-5 text-sm text-slate-200">
              <div className="flex items-end justify-between gap-4 border-b border-[var(--border-color)] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Predicted grade</p>
                  <p className="mt-1 text-6xl font-extrabold leading-none tracking-[-0.06em] text-[var(--tea-green)]">{grade}</p>
                </div>
                <ArrowUpRight className="mb-1 h-6 w-6 text-[#9bb6a2]" />
              </div>
              <ConfidenceBar value={confidencePercent} />
              <dl className="grid grid-cols-2 gap-3">
                <div className="border-l-2 border-[#b9dcc2] pl-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Output status</dt>
                  <dd className="mt-1 font-semibold text-slate-200">{result.statusMessage || 'Completed'}</dd>
                </div>
                <div className="border-l-2 border-[#b9dcc2] pl-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Decision mode</dt>
                  <dd className="mt-1 font-semibold text-slate-200">Confidence based</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Class Probability Table" subtitle="Model confidence distribution across tea grade classes.">
          <ProbabilityTable rows={result?.probability_table || []} />
        </Card>
        <Card title="Grade Insights" subtitle="Interpretation and quality recommendations for supervisors.">
          <div className="space-y-5">
            <InsightBlock label="Grade profile">{gradeDescription}</InsightBlock>
            <InsightBlock label="Supervisor recommendation">{recommendation}</InsightBlock>
          </div>
        </Card>
      </div>
      <Card title="Recent Grade Classification History" subtitle="Most recent tea grade outputs.">
        <DataTable
          columns={[{ key: 'date', label: 'Date' }, { key: 'grade', label: 'Predicted Grade' }, { key: 'confidence', label: 'Confidence' }, { key: 'status', label: 'Status Message' }]}
          rows={rows}
          emptyState={<EmptyState icon={FlaskConical} title="No grade history yet" description="Classification results will appear here after model runs." />}
        />
      </Card>
    </div>
  )
}

export default TeaGradeClassificationPage
