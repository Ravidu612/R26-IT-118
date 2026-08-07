import { Bug, Leaf, ScanSearch } from 'lucide-react'
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
import TeaDiseaseResult from '../../components/models/TeaDiseaseResult'
import { useImageUpload } from '../../hooks/useImageUpload'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'

function TeaLeafDetectionPage() {
  const [activeTab, setActiveTab] = useState('leaf')
  const imageUpload = useImageUpload()
  const [result, setResult] = useState(null)
  const [diseaseResult, setDiseaseResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [diseaseHistory, setDiseaseHistory] = useState([])

  const refreshHistory = async () => {
    const all = await predictionService.listPredictions()
    setHistory(all.filter((item) => item.moduleType === 'tea_leaf_detection').slice(0, 8))
    setDiseaseHistory(all.filter((item) => item.moduleType === 'tea_leaf_disease_detection').slice(0, 8))
  }

  const detectDisease = async () => {
    if (!imageUpload.file) {
      setError('Please upload a tea image before disease detection.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const detection = await modelService.detectTeaLeafDisease(imageUpload.file)
      setDiseaseResult(detection)
      await refreshHistory()
    } catch (apiError) {
      setError(apiError.message || 'Disease detection failed')
    } finally {
      setIsLoading(false)
    }
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
    () => (activeTab === 'leaf' ? history : diseaseHistory).map((item) => ({
        id: item._id,
        date: new Date(item.createdAt).toLocaleString(),
        result: activeTab === 'leaf' ? (item.result?.detected ? 'Tea leaf detected' : 'Not detected') : item.result?.predicted_disease || '-',
        confidence: item.result?.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : '-',
        status: item.result?.statusMessage || 'Completed',
      })),
    [activeTab, diseaseHistory, history],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Tea Leaf Analysis" description="Validate tea leaves and identify visible disease classes with dedicated AI models." />
      <div className="inline-flex rounded-xl border border-[#dce9df] bg-white p-1 shadow-sm">
        <TabButton active={activeTab === 'leaf'} icon={Leaf} onClick={() => setActiveTab('leaf')}>Leaf Detection</TabButton>
        <TabButton active={activeTab === 'disease'} icon={Bug} onClick={() => setActiveTab('disease')}>Disease Detection</TabButton>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title={activeTab === 'leaf' ? 'Upload and Detect' : 'Upload and Detect Disease'} subtitle="Use the same tea leaf image for either analysis." className="xl:col-span-2">
          <ImageUpload
            fileName={imageUpload.file?.name}
            previewUrl={imageUpload.previewUrl}
            isDragging={imageUpload.isDragging}
            onFileSelect={imageUpload.onFileSelect}
            dragHandlers={imageUpload.dragHandlers}
            inputId="tea-leaf-detection-upload"
          />
          {error ? <Alert tone="error" message={error} /> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button icon={activeTab === 'leaf' ? ScanSearch : Bug} onClick={activeTab === 'leaf' ? detectTeaLeaf : detectDisease} isLoading={isLoading}>
              {activeTab === 'leaf' ? 'Detect Tea Leaf' : 'Detect Disease'}
            </Button>
            <Button variant="outline" onClick={imageUpload.clear}>
              Clear Image
            </Button>
          </div>
        </Card>
        <Card title={activeTab === 'leaf' ? 'Detection Result' : 'Disease Result'} subtitle={activeTab === 'leaf' ? 'Status, confidence, bounding box preview, and recommendation.' : 'Disease class, confidence scores, annotated output, and recommendation.'}>
          {isLoading ? <Loader text={activeTab === 'leaf' ? 'Running tea leaf object detection...' : 'Running disease detection...'} /> : null}
          {!isLoading && activeTab === 'leaf' && !result ? <EmptyState icon={Leaf} title="No detection result yet" description="Upload and run detection to view tea leaf validation output." /> : null}
          {!isLoading && activeTab === 'disease' && !diseaseResult ? <EmptyState icon={Bug} title="No disease result yet" description="Upload and run disease detection to view the predicted class." /> : null}
          {activeTab === 'leaf' && result ? (
            <div className="space-y-3 text-sm text-slate-200">
              <p>Detection status: <Badge tone={result.detected ? 'success' : 'warning'}>{result.detected ? 'Tea leaf detected' : 'Not a tea leaf'}</Badge></p>
              <p>Confidence: {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '-'}</p>
              <p>Class: {result.detectedClass || '-'}</p>
              <p>
                Thresholds: Conf {result.thresholdsUsed?.confidence ?? 0.7} / IoU {result.thresholdsUsed?.iou ?? 0.7}
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
          {activeTab === 'disease' && diseaseResult ? <TeaDiseaseResult result={diseaseResult} /> : null}
        </Card>
      </div>
      <Card title={activeTab === 'leaf' ? 'Recent Tea Leaf Detection Results' : 'Recent Disease Detection Results'} subtitle="Most recent analyses stored in prediction history.">
        <DataTable
          columns={[{ key: 'date', label: 'Date' }, { key: 'result', label: 'Result' }, { key: 'confidence', label: 'Confidence' }, { key: 'status', label: 'Status Message' }]}
          rows={rows}
          emptyState={<EmptyState icon={activeTab === 'leaf' ? Leaf : Bug} title={activeTab === 'leaf' ? 'No tea leaf detection history' : 'No disease detection history'} description="Run detections to populate this history table." />}
        />
      </Card>
    </div>
  )
}

function TabButton({ active, children, icon: Icon, onClick }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${active ? 'bg-[#19764d] text-white shadow-sm' : 'text-[#718077] hover:bg-[#f1f8f3] hover:text-[#19764d]'}`}><Icon className="h-4 w-4" />{children}</button>
}

export default TeaLeafDetectionPage
