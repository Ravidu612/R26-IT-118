import { Lock, RefreshCcw, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import { authService } from '../../services/authService'
import { modelService } from '../../services/modelService'

function SettingsPage() {
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '' })

  const loadSettings = async () => {
    try {
      setError('')
      const [user, modelStatus] = await Promise.all([authService.me(), modelService.getModelStatus()])
      setProfile(user)
      setForm({ fullName: user.fullName || '', email: user.email || '' })
      setStatus(modelStatus)
    } catch (apiError) {
      setError(apiError.message || 'Unable to load settings data')
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadSettings().catch(() => {})
    }, 0)
    return () => clearTimeout(timerId)
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Profile, service status, and security controls for TeaGuard AI platform administration."
        action={<Button icon={RefreshCcw} variant="outline" onClick={() => loadSettings().catch(() => {})}>Refresh Status</Button>}
      />
      {error ? <Alert tone="error" message={error} /> : null}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Profile Settings" subtitle="Update account profile view (editing workflow can be extended).">
          {!profile ? <EmptyState icon={Settings} title="No profile loaded" description="Sign in to load profile settings." /> : (
            <div className="space-y-3">
              <Input id="profile-name" label="Full Name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              <Input id="profile-email" label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              <p className="text-sm text-slate-300">Role: <Badge tone="info">{profile.role}</Badge></p>
              <Button disabled variant="outline">Save Changes (Coming Soon)</Button>
            </div>
          )}
        </Card>
        <Card title="Model Service Status" subtitle="Backend model runtime and API connectivity.">
          {!status ? <EmptyState icon={RefreshCcw} title="Status unavailable" description="Refresh to check model service health." /> : (
            <div className="space-y-2 text-sm text-slate-200">
              <p>Tea Leaf Detection: {status.teaLeaf?.runtime || 'unknown'}</p>
              <p>Tea Grade Classification: {status.teaGrade?.runtime || 'unknown'}</p>
              <p>Worker Health Risk: {status.workerHealth?.runtime || 'unknown'}</p>
              <p>Backend Connection: <Badge tone="success">Connected</Badge></p>
            </div>
          )}
        </Card>
        <Card title="Security Notice" subtitle="Credential and secret handling policy.">
          <div className="space-y-3 text-sm text-slate-300">
            <p className="inline-flex items-center gap-2 text-slate-100">
              <Lock className="h-4 w-4 text-emerald-200" />
              Hugging Face tokens are stored server-side only.
            </p>
            <p>Frontend does not expose API keys, tokens, or MongoDB secrets.</p>
            <p>All model requests go through backend API routes only.</p>
            <Button variant="outline" disabled>Rotate Keys (Backend Admin Only)</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
