import { useCallback, useEffect, useState } from 'react'
import { iotService } from '../services/iotService'

const POLL_INTERVAL_MS = 1500

const mergeTrend = (previous, current, key) => {
  const serverTrend = current.trends?.[key] || []
  const previousTrend = previous?.trends?.[key] || []
  const baseTrend = serverTrend.length >= previousTrend.length ? serverTrend : previousTrend
  const value = Number(current.latestReading?.[key])
  if (!Number.isFinite(value)) return baseTrend
  const timeMs = current.latestReading?.timeMs ?? Date.now()
  const lastPoint = baseTrend.at(-1)
  if (lastPoint?.timeMs === timeMs) return baseTrend
  return [...baseTrend, { timeMs, value }].slice(-60)
}

const mergeLatestWithTrend = (previous, current) => {
  const sameDevice = previous?.deviceId === current?.deviceId
  const base = sameDevice ? previous : null
  return {
    ...current,
    trends: {
      bpm: mergeTrend(base, current, 'bpm'),
      liveBpm: mergeTrend(base, current, 'liveBpm'),
    },
  }
}

export function useLiveWorkerHealth(deviceId, enabled) {
  const [devices, setDevices] = useState([])
  const [activeDeviceId, setActiveDeviceId] = useState(deviceId || '')
  const [latest, setLatest] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    try {
      const deviceList = await iotService.listDevices()
      setDevices(deviceList)
      const nextDeviceId = deviceId || activeDeviceId || deviceList[0]?.deviceId || ''
      setActiveDeviceId(nextDeviceId)
      if (nextDeviceId) {
        const current = await iotService.getLatestWorkerHealth(nextDeviceId)
        setLatest((previous) => mergeLatestWithTrend(previous, current))
      }
      else setLatest(null)
      setError('')
    } catch (apiError) {
      setError(apiError.message || 'Unable to load live IoT data')
    } finally {
      setIsLoading(false)
    }
  }, [activeDeviceId, deviceId, enabled])

  useEffect(() => {
    if (!enabled) return undefined
    const initialTimerId = setTimeout(() => load().catch(() => {}), 0)
    const timerId = setInterval(() => load().catch(() => {}), POLL_INTERVAL_MS)
    return () => {
      clearTimeout(initialTimerId)
      clearInterval(timerId)
    }
  }, [enabled, load])

  return { devices, activeDeviceId, latest, isLoading, error }
}
