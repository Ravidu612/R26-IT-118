import { ClipboardCheck, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import { defaultWorkerHealthValues, workerHealthGroups, workerHealthPresets } from '../../constants/modelFields'
import { taskService } from '../../services/taskService'
import { workerService } from '../../services/workerService'

const riskLevels = ['Low', 'Medium', 'High', 'Critical']
const riskTone = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'danger' }
const defaultWorkerOption = { name: 'Worker A', role: 'General' }
const taskDetail = (task) => [task?.taskId, task?.difficulty, task?.requiredSkill].filter(Boolean).join(' | ')

function TaskAssignmentPage() {
  const [tasks, setTasks] = useState([])
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState({ workerName: '', preferredSkill: '', readings: defaultWorkerHealthValues })
  const [recommendation, setRecommendation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsLoading(true)
      Promise.all([taskService.listTasks(), workerService.listWorkers()])
        .then(([taskList, workerList]) => {
          setTasks(taskList)
          setWorkers(workerList)
          if (workerList[0]?.name) {
            setForm((current) => ({
              ...current,
              workerName: current.workerName || workerList[0].name,
              preferredSkill: current.preferredSkill || workerList[0].role || 'General',
            }))
          }
        })
        .catch((apiError) => {
          setError(apiError.message || 'Unable to load task assignment data')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 0)
    return () => clearTimeout(timerId)
  }, [])

  const workerOptions = workers.length ? workers : [defaultWorkerOption]
  const handleWorkerSelect = (workerName) => {
    const selected = workerOptions.find((worker) => worker.name === workerName)
    setRecommendation(null)
    setForm((current) => ({ ...current, workerName, preferredSkill: selected?.role || current.preferredSkill || 'General' }))
  }
  const applyPreset = (presetName) => {
    setRecommendation(null)
    setForm((current) => ({ ...current, readings: workerHealthPresets[presetName] }))
  }
  const updateReading = (key, value) => {
    setRecommendation(null)
    setForm((current) => ({ ...current, readings: { ...current.readings, [key]: Number(value) } }))
  }

  const payload = { workerName: form.workerName, preferredSkill: form.preferredSkill || null, readings: form.readings }

  const requestRecommendation = async () => {
    setError('')
    try {
      const output = await taskService.recommendTask(payload)
      setRecommendation(output)
    } catch (apiError) {
      setError(apiError.message || 'Recommendation failed')
    }
  }

  const assignTask = async () => {
    setError('')
    const created = await taskService.assignTask(payload)
    setRecommendation(created.recommendation || null)
    setTasks((current) => [created.assignment || created, ...current])
  }

  const summary = useMemo(() => riskLevels.map((risk) => ({ risk, count: tasks.filter((task) => task.riskLevel === risk).length })), [tasks])

  return (
    <div className="space-y-4">
      <PageHeader title="Task Assignment" description="Generate and assign risk-based work tasks for tea field and factory teams." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => <Card key={item.risk}><p className="text-sm text-slate-300">{item.risk} Risk</p><p className="text-2xl font-bold text-white">{item.count}</p></Card>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Assign Task Panel" subtitle="Select worker and risk profile to get recommended assignment." className="xl:col-span-2">
          <div className="grid gap-3 md:grid-cols-2">
            <Select id="worker-select" label="Worker" value={form.workerName} onChange={(event) => handleWorkerSelect(event.target.value)} options={workerOptions.map((worker) => ({ label: worker.name, value: worker.name }))} />
            <Input id="preferred-skill" label="Preferred Skill" value={form.preferredSkill} onChange={(event) => { setRecommendation(null); setForm((current) => ({ ...current, preferredSkill: event.target.value })) }} />
          </div>
          <div className="my-3 flex flex-wrap gap-2">
            {Object.keys(workerHealthPresets).map((preset) => <Button key={preset} size="sm" variant="outline" onClick={() => applyPreset(preset)}>{preset} Preset</Button>)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workerHealthGroups.map((group) => (
              <Card key={group.title} title={group.title} className="bg-slate-900/35 p-4">
                <div className="grid gap-3">
                  {group.fields.map((field) => (
                    <Input key={field.key} id={`task-${field.key}`} type="number" label={field.label} value={form.readings[field.key]} onChange={(event) => updateReading(field.key, event.target.value)} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={requestRecommendation}>Get Auto Recommendation</Button>
            <Button variant="outline" onClick={() => assignTask().catch((apiError) => setError(apiError.message))}>
              Auto Assign Task
            </Button>
          </div>
          {error ? <Alert tone="error" message={error} /> : null}
        </Card>
        <Card title="Recommended Task Queue" subtitle="Latest recommendation and approval guidance.">
          {!recommendation ? <EmptyState icon={ClipboardCheck} title="No recommendation yet" description="Generate recommendation to view risk-based task guidance." /> : (
            <div className="space-y-2 text-sm text-slate-200">
              <p>Worker: {recommendation.workerName}</p>
              <p>Risk Level: <Badge tone={riskTone[recommendation.riskLevel] || 'warning'}>{recommendation.riskLevel}</Badge></p>
              <p>Recommended Task: {recommendation.suggestedTask}</p>
              <p>Task Detail: {taskDetail(recommendation.primaryTask) || '-'}</p>
              <p>Supervisor Approval: {recommendation.supervisorApprovalStatus}</p>
              <p>Predicted Health State: {recommendation.healthState || '-'}</p>
              <p>Model Confidence: {recommendation.modelPrediction?.confidence ? `${(recommendation.modelPrediction.confidence * 100).toFixed(1)}%` : '-'}</p>
            </div>
          )}
        </Card>
      </div>
      <Card title="Task Assignment Table" subtitle="Worker risk-based task queue and supervisor status.">
        <DataTable
          columns={[{ key: 'worker', label: 'Worker' }, { key: 'healthState', label: 'Health State' }, { key: 'riskLevel', label: 'Risk Level', render: (value) => <Badge tone={riskTone[value] || 'warning'}>{value}</Badge> }, { key: 'recommendedTask', label: 'Recommended Task' }, { key: 'difficulty', label: 'Difficulty' }, { key: 'skill', label: 'Skill' }, { key: 'assignedBy', label: 'Assigned By' }, { key: 'status', label: 'Status' }]}
          rows={tasks.map((task) => ({ id: task._id, worker: task.workerName, healthState: task.recommendationMeta?.healthState || task.recommendationMeta?.modelPrediction?.predicted_state || (task.riskLevel === 'Low' ? 'relaxed' : task.riskLevel === 'Medium' ? 'emotional_stress' : task.riskLevel === 'High' ? 'cognitive_stress' : 'physical_stress'), riskLevel: task.riskLevel, recommendedTask: task.suggestedTask, difficulty: task.difficulty || '-', skill: task.requiredSkill || '-', assignedBy: task.assignedBy || 'supervisor', status: task.approvalStatus || 'Pending' }))}
          isLoading={isLoading}
          emptyState={<EmptyState icon={ShieldAlert} title="No tasks assigned yet" description="Assign recommended tasks to build the operational queue." />}
        />
      </Card>
    </div>
  )
}

export default TaskAssignmentPage
