import { Activity, BrainCircuit, HeartPulse, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import LiveWorkerHealthPanel from '../../components/iot/LiveWorkerHealthPanel'
import WorkerHealthFeatureFields from '../../components/iot/WorkerHealthFeatureFields'
import ProbabilityTable from '../../components/models/ProbabilityTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Loader from '../../components/ui/Loader'
import PageHeader from '../../components/ui/PageHeader'
import { defaultWorkerHealthValues, workerHealthPresets } from '../../constants/modelFields'
import { useLiveWorkerHealth } from '../../hooks/useLiveWorkerHealth'
import { modelService } from '../../services/modelService'

const riskToneMap = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'danger' }

function WorkerHealthRiskPage() {
  const [mode, setMode] = useState('manual')
  const [workerName, setWorkerName] = useState('Worker A')
  const [formValues, setFormValues] = useState(defaultWorkerHealthValues)
  const [liveDeviceId, setLiveDeviceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const liveData = useLiveWorkerHealth(liveDeviceId, mode === 'iot')
  const selectedDeviceId = liveDeviceId || liveData.activeDeviceId
  const displayedFormValues = mode === 'iot'
    ? Object.keys(defaultWorkerHealthValues).reduce((values, key) => ({ ...values, [key]: liveData.latest?.features?.[key] ?? '' }), {})
    : formValues

  const handleFieldChange = (key, value) => setFormValues((current) => ({ ...current, [key]: Number(value) }))

  const applyPreset = (presetName) => {
    setFormValues(workerHealthPresets[presetName])
    setError('')
  }

  const predictRisk = async () => {
    setError('')
    setIsLoading(true)
    try {
      const output = await modelService.predictWorkerHealthRisk(formValues)
      setResult({ ...output, workerName })
    } catch (apiError) {
      setError(apiError.message || 'Health risk prediction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeLiveData = async () => {
    setError('')
    setIsLoading(true)
    try {
      const output = await modelService.analyzeLiveWorkerHealth({ deviceId: selectedDeviceId, workerName })
      setResult({ ...output, workerName })
    } catch (apiError) {
      setError(apiError.message || 'Prediction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resultItems = useMemo(
    () => [
      { label: 'Predicted Session State', value: result?.model_state || result?.predicted_state || '-' },
      { label: 'Confidence', value: result?.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '-' },
      { label: 'Workload Mapping', value: result?.risk_level || '-' },
      { label: 'Model Type', value: result?.model_type || 'Manual compatibility mode' },
      { label: 'Recommendation', value: result?.next_day_recommendation || '-' },
      { label: 'Medical Interpretation', value: result?.medical_checkup || '-' },
    ],
    [result],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Worker Activity & Stress" description="Classify secure live ESP32/MAX30102/MPU6500 wearable windows with the fine-tuned Hugging Face model." />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mode === 'manual' ? 'secondary' : 'outline'} onClick={() => setMode('manual')}>Manual Input</Button>
        <Button size="sm" variant={mode === 'iot' ? 'secondary' : 'outline'} onClick={() => setMode('iot')}>Live IoT Data</Button>
      </div>
      {mode === 'iot' ? <LiveWorkerHealthPanel {...liveData} deviceId={selectedDeviceId} onDeviceChange={setLiveDeviceId} onAnalyze={analyzeLiveData} isAnalyzing={isLoading} /> : null}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title={mode === 'iot' ? 'Live Feature Window' : 'Health Input Form'} subtitle={mode === 'iot' ? 'Calculated model inputs are read-only until you return to Manual Input.' : 'Grouped HR, SpO2, and trend features.'} className="xl:col-span-2">
          <Input id="worker-name" label="Worker Name" value={workerName} onChange={(event) => setWorkerName(event.target.value)} />
          {mode === 'manual' ? (
            <div className="my-4 flex flex-wrap gap-2">
              {Object.keys(workerHealthPresets).map((preset) => <Button key={preset} size="sm" variant="outline" onClick={() => applyPreset(preset)}>{preset} Preset</Button>)}
            </div>
          ) : null}
          <WorkerHealthFeatureFields values={displayedFormValues} onChange={handleFieldChange} readOnly={mode === 'iot'} />
          {error ? <div className="mt-4"><Alert tone="error" message={error} /></div> : null}
          {mode === 'manual' ? <Button icon={HeartPulse} onClick={predictRisk} isLoading={isLoading} className="mt-4">Predict Health Risk</Button> : null}
        </Card>
        <PredictionResult isLoading={isLoading} result={result} resultItems={resultItems} />
      </div>
      <Card title="Class Probability Table" subtitle="Probability spread across AEROBIC, ANAEROBIC, and STRESS session classes.">
        <ProbabilityTable rows={result?.probability_table || []} />
      </Card>
    </div>
  )
}

function PredictionResult({ isLoading, result, resultItems }) {
  const confidence = Math.round((Number(result?.confidence) || 0) * 100)
  const state = result?.model_state || result?.predicted_state || '-'
  const detailItems = resultItems.filter(({ label }) => !['Predicted Session State', 'Confidence', 'Workload Mapping'].includes(label))

  return (
    <Card className="overflow-hidden">
      <div className="-m-5 md:-m-6">
        <div className="border-b border-[#dce9df] bg-gradient-to-br from-[#f4fbf5] via-white to-[#e8f6ee] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#57906b]">AI analysis</p>
              <h3 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[#17231c]">Prediction Result</h3>
              <p className="mt-1 text-sm text-[#718077]">A quick supervisor view of the latest model result.</p>
            </div>
            <div className="rounded-2xl bg-white p-3 text-[#19764d] shadow-[0_8px_18px_rgba(33,97,63,.1)]">
              <BrainCircuit className="h-6 w-6" />
            </div>
          </div>
        </div>

        {isLoading ? <div className="p-5 md:p-6"><Loader text="Analyzing health risk..." /></div> : null}
        {!isLoading && !result ? <div className="p-5 md:p-6"><EmptyState icon={Stethoscope} title="No health prediction yet" description="Collect live data or enter worker readings to view risk analytics." /></div> : null}
        {result ? (
          <div className="space-y-4 bg-white p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3eee6] bg-[#fbfefb] p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-[#e6f4ea] p-2.5 text-[#19764d]"><UserRound className="h-5 w-5" /></div>
                <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#829087]">Worker</p><p className="truncate text-sm font-bold text-[#17231c]">{result.workerName || 'Unknown Worker'}</p></div>
              </div>
              <Badge tone={riskToneMap[result.risk_level] || 'warning'}>{result.risk_level || 'Review'}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ResultMetric icon={Activity} label="Session state" value={state} accent="teal" />
              <ResultMetric icon={ShieldCheck} label="Workload mapping" value={result.risk_level || '-'} accent="green" />
            </div>

            <div className="rounded-2xl border border-[#e3eee6] bg-[#f8fcf9] p-4">
              <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-[#718077]">Model confidence</p><p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#17231c]">{confidence}%</p></div><span className="text-xs font-semibold text-[#57906b]">{confidence >= 80 ? 'High confidence' : 'Review recommended'}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfece2]"><div className="h-full rounded-full bg-gradient-to-r from-[#67b77f] to-[#19764d] transition-all" style={{ width: `${confidence}%` }} /></div>
            </div>

            <div className="space-y-2.5">
              {detailItems.slice(0, 1).map((item) => <DetailRow key={item.label} label={item.label} value={item.value} />)}
              {detailItems.slice(1).map((item) => <NoteRow key={item.label} label={item.label} value={item.value} />)}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

function ResultMetric({ icon: Icon, label, value, accent }) {
  const iconClass = accent === 'teal' ? 'bg-[#e8f8f6] text-[#1f8a8f]' : 'bg-[#e8f4e9] text-[#19764d]'
  return <div className="rounded-2xl border border-[#e3eee6] bg-white p-3.5"><div className="flex items-center gap-2"><span className={`rounded-lg p-1.5 ${iconClass}`}><Icon className="h-4 w-4" /></span><span className="text-xs font-semibold text-[#829087]">{label}</span></div><p className="mt-2 truncate text-base font-bold capitalize text-[#17231c]">{String(value).replaceAll('_', ' ')}</p></div>
}

function DetailRow({ label, value }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f5faf6] px-3.5 py-3 text-sm"><span className="text-[#718077]">{label}</span><span className="max-w-[58%] truncate text-right font-semibold text-[#2d6a4f]">{value}</span></div>
}

function NoteRow({ label, value }) {
  const isMedical = label === 'Medical Interpretation'
  return <div className={`rounded-xl border px-3.5 py-3 ${isMedical ? 'border-[#f1e6c5] bg-[#fffaf0]' : 'border-[#dceee0] bg-[#f4fbf5]'}`}><div className="flex items-start gap-2"><span className={`mt-0.5 text-xs font-bold uppercase tracking-[0.1em] ${isMedical ? 'text-[#a47a22]' : 'text-[#57906b]'}`}>{label}</span></div><p className="mt-1 text-sm leading-5 text-[#52645a]">{value}</p></div>
}

export default WorkerHealthRiskPage
