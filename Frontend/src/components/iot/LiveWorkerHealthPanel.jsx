import { Activity, Bluetooth, HeartPulse, WifiOff } from 'lucide-react'
import Alert from '../ui/Alert'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Loader from '../ui/Loader'
import Select from '../ui/Select'
import VitalTrendChart from './VitalTrendChart'

const statusTone = (online) => (online ? 'success' : 'danger')
const display = (value, suffix = '') => (value === null || value === undefined ? '-' : `${value}${suffix}`)

const getMessage = (latest, error) => {
  if (error) return error
  if (!latest?.online) return latest?.lastSeen ? 'Device disconnected' : 'Waiting for device connection'
  if (!latest.latestReading) return 'Place finger on the sensor. Poor signal or incomplete readings are ignored.'
  if (latest.windowReady) return 'Data window is ready'
  return `Collecting valid readings: ${latest.collectionProgress}%`
}

function LiveWorkerHealthPanel({ devices, deviceId, onDeviceChange, latest, isLoading, error, onAnalyze, isAnalyzing }) {
  const message = getMessage(latest, error)
  const tone = error || !latest?.online ? 'error' : latest?.windowReady ? 'success' : 'info'
  const latestReading = latest?.latestReading

  return (
    <Card title="Live IoT Data" subtitle="Secure backend MQTT HR, PPG, and motion stream from the selected wearable device.">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          id="iot-device"
          label="Device"
          value={deviceId}
          onChange={(event) => onDeviceChange(event.target.value)}
          options={devices.length ? devices.map((device) => ({ value: device.deviceId, label: device.deviceId })) : [{ value: '', label: 'No devices discovered' }]}
          disabled={!devices.length}
          helperText="Devices appear when the backend receives MQTT status or vitals messages."
        />
        <div className="space-y-2 text-sm text-slate-200">
          <p className="text-sm font-medium text-slate-200">Connection status</p>
          <div className="flex items-center gap-2">
            {latest?.online ? <Bluetooth className="h-4 w-4 text-emerald-300" /> : <WifiOff className="h-4 w-4 text-rose-300" />}
            <Badge tone={statusTone(Boolean(latest?.online))}>{latest?.online ? 'Online' : 'Offline'}</Badge>
          </div>
          <p className="text-xs text-slate-400">Last seen: {latest?.lastSeen ? new Date(latest.lastSeen).toLocaleString() : '-'}</p>
        </div>
      </div>
      {isLoading && !latest ? <div className="mt-4"><Loader text="Connecting to live data..." /></div> : null}
      <div className="mt-4"><Alert tone={tone} message={message} /></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <VitalTrendChart label="Latest BPM" value={latestReading?.bpm} unit=" bpm" data={latest?.trends?.bpm} color="#1f8a8f" />
        <VitalTrendChart label="Live BPM" value={latestReading?.liveBpm} unit=" bpm" data={latest?.trends?.liveBpm} color="#4f9d69" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Metric label="Latest SpO2" value={display(latestReading?.spo2, '%')} />
        <Metric label="Signal" value={latestReading ? 'Good' : 'Waiting'} />
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>30-second collection</span>
          <span>{latest?.collectionProgress || 0}% · {latest?.validReadingCount || 0} valid readings</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-[var(--tea-teal)] transition-all" style={{ width: `${latest?.collectionProgress || 0}%` }} />
        </div>
      </div>
      <Button icon={HeartPulse} className="mt-4" onClick={onAnalyze} isLoading={isAnalyzing} disabled={!latest?.windowReady || !deviceId}>
        Analyze Live Data
      </Button>
    </Card>
  )
}

function Metric({ label, value }) {
  return <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 flex items-center gap-1 text-lg font-semibold text-white"><Activity className="h-4 w-4 text-teal-200" />{value}</p></div>
}

export default LiveWorkerHealthPanel
