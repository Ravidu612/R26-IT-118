import Card from '../ui/Card'

function WorkerStatusCard({ worker }) {
  if (!worker) {
    return <Card title="Worker" subtitle="No worker selected yet." />
  }

  return (
    <Card title={worker.name} subtitle={worker.role}>
      <p className="text-sm text-slate-200">
        Health Status: <span className="font-semibold text-white">{worker.healthStatus}</span>
      </p>
    </Card>
  )
}

export default WorkerStatusCard
