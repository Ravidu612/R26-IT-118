import Card from '../ui/Card'

function ResultCard({ title, data }) {
  if (!data) {
    return <Card title={title} subtitle="No prediction yet. Submit input to view model output." />
  }

  return (
    <Card title={title}>
      <div className="space-y-2 text-sm text-slate-200">
        {Object.entries(data).map(([key, value]) => (
          <p key={key}>
            <span className="font-semibold capitalize text-white">{key.replaceAll('_', ' ')}:</span> {String(value)}
          </p>
        ))}
      </div>
    </Card>
  )
}

export default ResultCard
