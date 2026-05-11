import { PlusCircle, Users } from 'lucide-react'
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
import { workerService } from '../../services/workerService'

//Woker Page Update

const workerRoles = ['Tea Field Worker', 'Sorting Operator', 'Factory Line Worker', 'Supervisor']
const riskOptions = ['Low', 'Medium', 'High', 'Critical']
const riskTone = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'danger' }

function WorkersPage() {
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState({ name: '', role: workerRoles[0], healthStatus: 'Low' })
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadWorkers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const list = await workerService.listWorkers()
      setWorkers(list)
    } catch (apiError) {
      setError(apiError.message || 'Unable to load workers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadWorkers().catch(() => {})
    }, 0)
    return () => clearTimeout(timerId)
  }, [])

  const createWorker = async () => {
    if (!form.name.trim()) {
      setError('Worker name is required')
      return
    }
    setError('')
    try {
      const created = await workerService.createWorker({ name: form.name, role: form.role, healthStatus: form.healthStatus })
      setWorkers((current) => [created, ...current])
      setForm({ ...form, name: '' })
    } catch (apiError) {
      setError(apiError.message || 'Failed to add worker')
    }
  }

  const workerRows = useMemo(
    () =>
      workers.map((worker) => ({
        id: worker.id,
        worker: worker.name,
        role: worker.role,
        latestHr: worker.latestHr || 84,
        latestSpo2: worker.latestSpo2 || 96,
        riskLevel: worker.healthStatus || 'Low',
        assignedTask: worker.assignedTask || 'Not assigned',
        status: worker.status || 'Active',
      })),
    [workers],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Workers" description="Manage tea workforce profiles, health status snapshots, and assignment readiness." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Add Worker" subtitle="Register worker details for task assignment and health monitoring." className="xl:col-span-1">
          <div className="space-y-3">
            <Input id="worker-name" label="Worker Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Select id="worker-role" label="Role / Department" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} options={workerRoles.map((role) => ({ label: role, value: role }))} />
            <Select id="worker-risk" label="Latest Risk Level" value={form.healthStatus} onChange={(event) => setForm((current) => ({ ...current, healthStatus: event.target.value }))} options={riskOptions.map((risk) => ({ label: risk, value: risk }))} />
            <Button icon={PlusCircle} onClick={() => createWorker().catch(() => {})}>Add Worker</Button>
          </div>
          {error ? <Alert tone="error" message={error} /> : null}
        </Card>
        <Card title="Worker Profile Detail" subtitle="Select a worker from the table for details." className="xl:col-span-2">
          {!selectedWorker ? <EmptyState icon={Users} title="No worker selected" description="Select a worker from the list to view profile summary and task status." /> : (
            <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-200">
              <p>Name: {selectedWorker.worker}</p>
              <p>Role: {selectedWorker.role}</p>
              <p>Latest HR: {selectedWorker.latestHr}</p>
              <p>Latest SpO2: {selectedWorker.latestSpo2}</p>
              <p>Assigned Task: {selectedWorker.assignedTask}</p>
              <p>Status: {selectedWorker.status}</p>
            </div>
          )}
        </Card>
      </div>
      <Card title="Worker Management Table" subtitle="Profiles, risk levels, and assignment status at a glance.">
        <DataTable
          columns={[{ key: 'worker', label: 'Worker' }, { key: 'role', label: 'Role/Department' }, { key: 'latestHr', label: 'Latest HR' }, { key: 'latestSpo2', label: 'Latest SpO2' }, { key: 'riskLevel', label: 'Latest Risk', render: (value) => <Badge tone={riskTone[value] || 'warning'}>{value}</Badge> }, { key: 'assignedTask', label: 'Assigned Task' }, { key: 'status', label: 'Status' }]}
          rows={workerRows}
          isLoading={isLoading}
          emptyState={<EmptyState icon={Users} title="No workers yet" description="Add workers to begin health monitoring and task assignment workflows." />}
          renderRowActions={(row) => <Button size="sm" variant="outline" onClick={() => setSelectedWorker(row)}>View</Button>}
        />
      </Card>
    </div>
  )
}

export default WorkersPage
