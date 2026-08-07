import Card from '../ui/Card'
import Input from '../ui/Input'
import { workerHealthGroups } from '../../constants/modelFields'

function WorkerHealthFeatureFields({ values, onChange, readOnly = false }) {
  return (
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
                value={values[field.key] ?? ''}
                readOnly={readOnly}
                disabled={readOnly}
                onChange={(event) => onChange?.(field.key, event.target.value)}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default WorkerHealthFeatureFields
