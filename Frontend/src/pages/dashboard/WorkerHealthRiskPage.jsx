import { HeartPulse, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import ProbabilityTable from '../../components/models/ProbabilityTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Loader from '../../components/ui/Loader'
import PageHeader from '../../components/ui/PageHeader'
import { defaultWorkerHealthValues, workerHealthGroups, workerHealthPresets } from '../../constants/modelFields'
import { modelService } from '../../services/modelService'

const riskToneMap = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'danger' }

function WorkerHealthRiskPage() {
  const [workerName, setWorkerName] = useState('Worker A')
  const [formValues, setFormValues] = useState(defaultWorkerHealthValues)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

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

  const resultItems = useMemo(
    () => [
      { label: 'Predicted State', value: result?.predicted_state || '-' },
      { label: 'Confidence', value: result?.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '-' },
      { label: 'Health Score', value: result?.health_score || '-' },
      { label: 'Risk Level', value: result?.risk_level || '-' },
      { label: 'Estimated Recovery Time', value: result?.estimated_recovery_time || '-' },
      { label: 'Next Day Recommendation', value: result?.next_day_recommendation || '-' },
      { label: 'Medical Checkup', value: result?.medical_checkup || '-' },
    ],
    [result],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Worker Health Risk" description="Manual worker health inputs for stress-state prediction while IoT stream integration is pending." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Health Input Form" subtitle="Grouped HR, SpO2, and trend features." className="xl:col-span-2">
          <Input id="worker-name" label="Worker Name" value={workerName} onChange={(event) => setWorkerName(event.target.value)} />
          <div className="my-4 flex flex-wrap gap-2">
            {Object.keys(workerHealthPresets).map((preset) => (
              <Button key={preset} size="sm" variant="outline" onClick={() => applyPreset(preset)}>
                {preset} Preset
              </Button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workerHealthGroups.map((group) => (
              <Card key={group.title} title={group.title} className="bg-slate-900/35 p-4">
                <div className="grid gap-3">
                  {group.fields.map((field) => (
                    <Input
                      key={field.key}
                      id={field.key}
                      type="number"
                      label={field.label}
                      value={formValues[field.key]}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
          {error ? <Alert tone="error" message={error} /> : null}
          <Button icon={HeartPulse} onClick={predictRisk} isLoading={isLoading} className="mt-4">
            Predict Health Risk
          </Button>
        </Card>
        <Card title="Prediction Result" subtitle="Risk-aware recommendation panel for supervisors.">
          {isLoading ? <Loader text="Analyzing health risk..." /> : null}
          {!isLoading && !result ? <EmptyState icon={Stethoscope} title="No health prediction yet" description="Enter worker readings and run prediction to view risk analytics." /> : null}
          {result ? (
            <div className="space-y-3 text-sm text-slate-200">
              <p>Worker: <span className="font-semibold text-white">{result.workerName}</span></p>
              <p>Risk Level: <Badge tone={riskToneMap[result.risk_level] || 'warning'}>{result.risk_level}</Badge></p>
              {resultItems.map((item) => <p key={item.label}>{item.label}: {item.value}</p>)}
            </div>
          ) : null}
        </Card>
      </div>
      <Card title="Class Probability Table" subtitle="Probability spread across relaxed/emotional/cognitive/physical stress states.">
        <ProbabilityTable rows={result?.probability_table || []} />
      </Card>
    </div>
  )
}

export default WorkerHealthRiskPage
