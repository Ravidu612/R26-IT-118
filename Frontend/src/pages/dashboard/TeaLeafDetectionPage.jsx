import { Leaf, ScanSearch } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import PageHeader from '../../components/ui/PageHeader'
import ImageUpload from '../../components/models/ImageUpload'
import { useImageUpload } from '../../hooks/useImageUpload'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'

function TeaLeafDetectionPage() {
  const imageUpload = useImageUpload()
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const refreshHistory = async () => {
    const all = await predictionService.listPredictions()
    setHistory(all.filter((item) => item.moduleType === 'tea_leaf_detection').slice(0, 8))
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      refreshHistory().catch(() => {})
    }, 0)
    return () => clearTimeout(timerId)
  }, [])

  const detectTeaLeaf = async () => {
    if (!imageUpload.file) {
      setError('Please upload a tea image before detection.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const detection = await modelService.detectTeaLeaf(imageUpload.file)
      setResult(detection)
      await refreshHistory()
    } catch (apiError) {
      setError(apiError.message || 'Detection failed')
    } finally {
      setIsLoading(false)
    }
  }

  const rows = useMemo(
    () =>
      history.map((item) => ({
        id: item._id,
        date: new Date(item.createdAt).toLocaleString(),
        result: item.result?.detected ? 'Tea leaf detected' : 'Not detected',
        confidence: item.result?.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : '-',
        status: item.result?.statusMessage || 'Completed',
      })),
    [history],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Tea Leaf Detection" description="Validate whether uploaded images contain tea leaves before downstream grading." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Upload and Detect" subtitle="Drag-and-drop a tea sample image or browse from your device." className="xl:col-span-2">
          <ImageUpload
            fileName={imageUpload.file?.name}
            previewUrl={imageUpload.previewUrl}
            isDragging={imageUpload.isDragging}
            onFileSelect={imageUpload.onFileSelect}
            dragHandlers={imageUpload.dragHandlers}
            inputId="tea-leaf-detection-upload"
          />
          {error ? <Alert tone="error" message={error} /> : null}
          <div className="mt-4 flex gap-3">
            <Button icon={ScanSearch} onClick={detectTeaLeaf} isLoading={isLoading}>
              Detect Tea Leaf
            </Button>
            <Button variant="outline" onClick={imageUpload.clear}>
              Clear Image
            </Button>
          </div>
        </Card>
        <Card title="Detection Result" subtitle="Status, confidence, bounding box preview, and recommendation.">
          {isLoading ? <Loader text="Running tea leaf object detection..." /> : null}
          {!isLoading && !result ? <EmptyState icon={Leaf} title="No detection result yet" description="Upload and run detection to view tea leaf validation output." /> : null}
          {result ? (
            <div className="space-y-3 text-sm text-slate-200">
              <p>Detection status: <Badge tone={result.detected ? 'success' : 'warning'}>{result.detected ? 'Tea leaf detected' : 'Not a tea leaf'}</Badge></p>
              <p>Confidence: {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '-'}</p>
              <p>Class: {result.detectedClass || '-'}</p>
              <p>
                Thresholds: Conf {result.thresholdsUsed?.confidence ?? 0.5} / IoU {result.thresholdsUsed?.iou ?? 0.5}
              </p>
              <p>Recommendation: {result.detected ? 'Proceed to Tea Grade Classification.' : 'Upload a clearer tea leaf sample image.'}</p>
              <p>Bounding box count: {result.boundingBoxes?.length || 0}</p>
              {result.annotatedImageUrl ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Model Annotated Output</p>
                  <img src={result.annotatedImageUrl} alt="Annotated tea leaf detection output" className="w-full rounded-lg border border-[var(--border-color)] object-cover" />
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
      <Card title="Recent Tea Leaf Detection Results" subtitle="Most recent detections stored in prediction history.">
        <DataTable
          columns={[{ key: 'date', label: 'Date' }, { key: 'result', label: 'Result' }, { key: 'confidence', label: 'Confidence' }, { key: 'status', label: 'Status Message' }]}
          rows={rows}
          emptyState={<EmptyState icon={Leaf} title="No tea leaf detection history" description="Run detections to populate this history table." />}
        />
      </Card>
    </div>
  )
}

export default TeaLeafDetectionPage
