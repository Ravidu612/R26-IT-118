import { FlaskConical, Layers3 } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      <PageHeader title="Tea Grade Classification" description="Classify black tea powder grades and review confidence-based recommendations." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Upload for Classification" subtitle="Supports BM, BOP, BP, BROKEN_TEA, DUST, FANNING_2, PF, and PW_DUST." className="xl:col-span-2">
          <ImageUpload
            fileName={imageUpload.file?.name}
            previewUrl={imageUpload.previewUrl}
            isDragging={imageUpload.isDragging}
            onFileSelect={imageUpload.onFileSelect}
            dragHandlers={imageUpload.dragHandlers}
            inputId="tea-grade-classification-upload"
          />
          {error ? <Alert tone="error" message={error} /> : null}
          <div className="mt-4 flex gap-3">
            <Button icon={FlaskConical} onClick={classifyTeaGrade} isLoading={isLoading}>
              Classify Tea Grade
            </Button>
            <Button variant="outline" onClick={imageUpload.clear}>
              Clear Image
            </Button>
          </div>
        </Card>
        <Card title="Classification Result" subtitle="Predicted grade and confidence.">
          {isLoading ? <Loader text="Classifying tea grade..." /> : null}
          {!isLoading && !result ? <EmptyState icon={Layers3} title="No grade prediction yet" description="Upload a sample and run classification to view results." /> : null}
          {result ? (
            <div className="space-y-3 text-sm text-slate-200">
              <p>Predicted Grade: <Badge tone="success">{grade}</Badge></p>
              <p>Confidence: {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '-'}</p>
              <p>Status: {result.statusMessage || 'Completed'}</p>
            </div>
          ) : null}
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Class Probability Table" subtitle="Model confidence distribution across tea grade classes.">
          <ProbabilityTable rows={result?.probability_table || []} />
        </Card>
        <Card title="Grade Insights" subtitle="Interpretation and quality recommendations for supervisors.">
          <p className="mb-3 text-sm text-slate-200">Description: {gradeDescription}</p>
          <p className="text-sm text-slate-300">Recommendation: {recommendation}</p>
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
