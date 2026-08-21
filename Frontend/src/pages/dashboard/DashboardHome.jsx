import { Activity, AlertTriangle, ArrowRight, ClipboardCheck, HeartPulse, Leaf, ShieldCheck, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard'
import DashboardTeamPanel from '../../components/dashboard/DashboardTeamPanel'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import ProgressRing from '../../components/dashboard/ProgressRing'
import WeeklyActivityChart from '../../components/dashboard/WeeklyActivityChart'
import { useApi } from '../../hooks/useApi'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'
import { taskService } from '../../services/taskService'
import { workerService } from '../../services/workerService'

const riskTone = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'danger' }
const EMPTY_LIST = []
const resultLabel = (item) => item.result?.predicted_disease || item.result?.predicted_grade || item.result?.predicted_state || item.result?.detectedClass || (item.result?.detected ? 'Tea leaf detected' : 'Not detected')

function DashboardHome() {
  const predictionsApi = useApi(predictionService.listPredictions, { defaultData: [] })
  const tasksApi = useApi(taskService.listTasks, { defaultData: [] })
  const workersApi = useApi(workerService.listWorkers, { defaultData: [] })
  const statusApi = useApi(modelService.getModelStatus, { defaultData: null })
  const predictions = predictionsApi.data ?? EMPTY_LIST
  const workers = workersApi.data ?? EMPTY_LIST
  const tasks = tasksApi.data ?? EMPTY_LIST
  const healthPredictions = predictions.filter((item) => item.moduleType === 'worker_health_risk')
  const highRiskCount = healthPredictions.filter((item) => ['High', 'Critical'].includes(item.result?.risk_level)).length
  const healthScore = healthPredictions.length ? Math.round((healthPredictions.filter((item) => ['Low', 'Medium'].includes(item.result?.risk_level)).length / healthPredictions.length) * 100) : 0
  const activityData = useMemo(() => buildWeeklyActivity(predictions), [predictions])
  const riskCounts = useMemo(() => ['Low', 'Medium', 'High', 'Critical'].map((risk) => ({ risk, count: healthPredictions.filter((item) => item.result?.risk_level === risk).length })), [healthPredictions])
  const recentPredictions = predictions.slice(0, 5)
  const serviceOnline = !statusApi.error && !statusApi.isLoading

  return <div className="space-y-4 pb-5"><PageHeader title="Dashboard" description="Plan, prioritize, and monitor tea operations with clarity." action={<div className="flex gap-2"><Link to="/dashboard/workers" className="inline-flex h-10 items-center rounded-xl bg-[#00643e] px-4 text-sm font-bold text-[#ffffff] shadow-sm hover:bg-[#075333]"><Users className="mr-2 h-4 w-4" />Add Worker</Link><Link to="/dashboard/reports" className="inline-flex h-10 items-center rounded-xl border border-[#d8e6dc] bg-white px-4 text-sm font-semibold text-[#23613f] hover:bg-[#f1f8f3]">View Reports</Link></div>} /><section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"><DashboardStatCard title="Total Predictions" value={predictions.length} caption="Across all AI modules" icon={Activity} href="/dashboard/prediction-history" featured /><DashboardStatCard title="Active Workers" value={workers.length} caption="Profiles in your workspace" icon={Users} href="/dashboard/workers" /><DashboardStatCard title="Health Checks" value={healthPredictions.length} caption="Live and manual assessments" icon={HeartPulse} href="/dashboard/worker-health-risk" /><DashboardStatCard title="High Risk Workers" value={highRiskCount} caption={highRiskCount ? 'Needs supervisor review' : 'No urgent alerts'} icon={AlertTriangle} href="/dashboard/worker-health-risk" /></section><section className="grid gap-3 lg:grid-cols-[1.35fr_1fr]"><Card><PanelHeader title="Prediction Analytics" subtitle="AI activity across the last seven days." action={<Badge tone="success">Live overview</Badge>} />{predictions.length ? <WeeklyActivityChart data={activityData} /> : <EmptyState icon={Activity} title="No activity yet" description="Run an AI module to start building your operational analytics." />}</Card><Card><PanelHeader title="Reminders" subtitle="Things that may need your attention." action={<Link to="/dashboard/task-assignment" className="text-[11px] font-bold text-[#16764d]">View all</Link>} /><div className="space-y-2.5"><Reminder icon={highRiskCount ? AlertTriangle : ShieldCheck} title={highRiskCount ? `${highRiskCount} health alert${highRiskCount > 1 ? 's' : ''} need review` : 'Worker health is looking steady'} tone={highRiskCount ? 'warning' : 'success'} href="/dashboard/worker-health-risk" /><Reminder icon={ClipboardCheck} title={`${tasks.length} task assignment${tasks.length === 1 ? '' : 's'} in queue`} tone="info" href="/dashboard/task-assignment" /><Reminder icon={serviceOnline ? ShieldCheck : AlertTriangle} title={serviceOnline ? 'AI services are connected' : 'Check model service status'} tone={serviceOnline ? 'success' : 'warning'} href="/dashboard/settings" /></div></Card></section><section className="grid gap-3 lg:grid-cols-4"><Card><PanelHeader title="Worker Health" subtitle="Risk distribution from recent checks." action={<Link to="/dashboard/worker-health-risk" className="text-[10px] font-bold text-[#16764d]">Open monitor <ArrowRight className="ml-1 inline h-3 w-3" /></Link>} /><ProgressRing value={healthScore} label="Stable" caption={healthPredictions.length ? `${healthPredictions.length} health checks recorded` : 'No health checks yet'} /><div className="mt-4 grid grid-cols-2 gap-2">{riskCounts.map((item) => <div key={item.risk} className="flex items-center justify-between rounded-lg bg-[#f7faf7] px-2.5 py-2 text-[10px]"><span className="flex items-center gap-1.5 text-[#718077]"><span className={`h-2 w-2 rounded-full ${item.risk === 'Low' ? 'bg-[#15965b]' : item.risk === 'Medium' ? 'bg-[#e3ad47]' : 'bg-[#df6b6b]'}`} />{item.risk}</span><span className="font-bold text-[#26372c]">{item.count}</span></div>)}</div></Card><Card><PanelHeader title="Recent Activity" subtitle="Latest model outputs." action={<Link to="/dashboard/prediction-history" className="text-[10px] font-bold text-[#16764d]">See all <ArrowRight className="ml-1 inline h-3 w-3" /></Link>} />{recentPredictions.length ? <div className="divide-y divide-[#edf1ed]">{recentPredictions.map((item, index) => <ActivityRow key={item._id} item={item} index={index} />)}</div> : <EmptyState icon={Leaf} title="Nothing to show yet" description="Prediction activity will appear here." />}</Card><DashboardTeamPanel workers={workers} /><TaskProgressCard tasks={tasks} workers={workers} healthPredictions={healthPredictions} highRiskCount={highRiskCount} serviceOnline={serviceOnline} /></section></div>
}

function PanelHeader({ title, subtitle, action }) {
  return <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-extrabold text-[#17231c]">{title}</h2>{subtitle ? <p className="mt-1 text-[11px] text-[#8a968d]">{subtitle}</p> : null}</div>{action}</div>
}

function Reminder({ icon: Icon, title, tone, href }) {
  return <Link to={href} className="flex items-center gap-3 rounded-xl border border-[#edf1ed] p-2.5 transition hover:border-[#b9d9c3] hover:bg-[#f7fbf8]"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone === 'warning' ? 'bg-amber-50 text-amber-600' : tone === 'info' ? 'bg-cyan-50 text-cyan-700' : 'bg-emerald-50 text-emerald-700'}`}><Icon className="h-4 w-4" /></span><span className="text-[11px] font-semibold text-[#33483a]">{title}</span><ArrowRight className="ml-auto h-4 w-4 text-[#9aaa9f]" /></Link>
}

function ActivityRow({ item, index }) {
  const isHealth = item.moduleType === 'worker_health_risk'
  const avatars = ['field-supervisor.png', 'factory-manager.png', 'health-officer.png', 'tea-worker.png']
  return <div className="flex items-center gap-2 py-2"><img src={`/assets/avatars/${avatars[index % avatars.length]}`} alt="Activity owner avatar" className="h-8 w-8 shrink-0 rounded-full object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-[#26372c]">{resultLabel(item)}</p><p className="mt-0.5 truncate text-[9px] text-[#8a968d]">{item.moduleType.replaceAll('_', ' ')} · {new Date(item.createdAt).toLocaleDateString()}</p></div><Badge tone={isHealth ? riskTone[item.result?.risk_level] || 'warning' : 'success'} className="px-2 py-0.5 text-[9px]">{isHealth ? item.result?.risk_level || 'Reviewed' : 'Completed'}</Badge></div>
}

function TaskProgressCard({ tasks, workers, healthPredictions, highRiskCount, serviceOnline }) {
  return <Card><PanelHeader title="Task Progress" subtitle="Current risk-based assignment workload." action={<Link to="/dashboard/task-assignment" className="text-[10px] font-bold text-[#16764d]">Manage tasks</Link>} /><div className="space-y-3"><ProgressBar label="Assigned tasks" value={tasks.length ? Math.min(100, tasks.length * 12) : 0} /><ProgressBar label="Worker health coverage" value={workers.length ? Math.min(100, healthPredictions.length * 10) : 0} /><ProgressBar label="Model readiness" value={serviceOnline ? 100 : 45} /></div><div className="mt-4 grid grid-cols-2 gap-2"><TaskMetric icon={ClipboardCheck} value={tasks.length} label="Total tasks" /><TaskMetric icon={Users} value={highRiskCount} label="Pending review" /></div></Card>
}

function ProgressBar({ label, value }) {
  return <div><div className="mb-1 flex items-center justify-between text-[10px]"><span className="font-semibold text-[#53665a]">{label}</span><span className="font-bold text-[#16764d]">{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#e8f0ea]"><div className="h-full rounded-full bg-[#16764d] transition-all" style={{ width: `${value}%` }} /></div></div>
}

function TaskMetric({ icon: Icon, value, label }) {
  return <div className="rounded-lg bg-[#f6f9f6] p-2"><div className="flex items-center gap-2 text-[#53665a]"><Icon className="h-3.5 w-3.5" /><span className="text-[12px] font-bold text-[#26372c]">{value}</span></div><p className="mt-1 text-[9px] text-[#8a968d]">{label}</p></div>
}

function buildWeeklyActivity(predictions) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setHours(0, 0, 0, 0); date.setDate(today.getDate() - (6 - index)); const key = localDateKey(date); return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), value: predictions.filter((item) => localDateKey(item.createdAt) === key).length } })
}

function localDateKey(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default DashboardHome
