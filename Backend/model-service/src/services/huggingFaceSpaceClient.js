import AppError from '../utils/AppError.js'
import { buildGradioCallUrl, getDefaultPredictUrl, getSpaceBaseUrl, normalizeApiName } from '../utils/spaceUrl.js'
const isDebug = process.env.MODEL_SERVICE_DEBUG === 'true'
const endpointCache = new Map()
const endpointCacheTtlMs = 5 * 60 * 1000
const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}
const safeJsonParse = (text) => {
  try {
    return JSON.parse(text)
  } catch (_error) {
    return null
  }
}
const readResponseBody = async (response) => {
  const rawText = await response.text()
  const parsed = safeJsonParse(rawText)
  return { rawText, parsed }
}
const extractHttpErrorReason = (body) => {
  if (!body) return ''
  if (typeof body.parsed === 'object' && body.parsed) {
    if (typeof body.parsed.error === 'string') return body.parsed.error
    if (typeof body.parsed.detail === 'string') return body.parsed.detail
    if (typeof body.parsed.message === 'string') return body.parsed.message
  }
  return typeof body.rawText === 'string' ? body.rawText.slice(0, 220) : ''
}
const parseSsePayload = (streamText) => {
  const lines = streamText.split('\n')
  let currentEvent = 'message'
  let lastFrame = null

  lines.forEach((line) => {
    if (line.startsWith('event: ')) currentEvent = line.replace('event: ', '').trim()
    if (!line.startsWith('data: ')) return
    const rawValue = line.replace('data: ', '')
    let parsedValue = rawValue
    try {
      parsedValue = JSON.parse(rawValue)
    } catch (_error) {
      parsedValue = rawValue
    }
    lastFrame = { event: currentEvent, data: parsedValue }
  })

  if (!lastFrame) return { event: 'unknown', data: { raw: streamText } }
  return lastFrame
}
const getSseErrorReason = (ssePayload) => {
  const data = ssePayload?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error
    if (data.detail) return String(data.detail)
  }
  return 'Unknown Space error'
}
const getRankedApiNames = (apiNames) => {
  const withScores = apiNames.map((name) => {
    let score = 0
    if (name === 'predict') score -= 40
    if (name.startsWith('predict')) score += 50
    if (name.includes('predict')) score += 20
    if (name.includes('health')) score += 15
    if (name.includes('risk')) score += 12
    if (name.includes('worker')) score += 10
    if (name.includes('heart')) score += 8
    if (name.includes('spo2')) score += 8
    return { name, score }
  })
  return withScores.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map((item) => item.name)
}
const discoverPredictUrls = async ({ space, token, timeoutMs }) => {
  const cached = endpointCache.get(space)
  if (cached && Date.now() - cached.createdAt < endpointCacheTtlMs) return cached.urls

  const baseUrl = getSpaceBaseUrl(space)
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const apiNames = new Set(['predict'])
  try {
    const infoResponse = await fetchWithTimeout(`${baseUrl}/gradio_api/info`, { method: 'GET', headers }, timeoutMs)
    if (infoResponse.ok) {
      const info = await infoResponse.json()
      const named = info?.named_endpoints && typeof info.named_endpoints === 'object' ? info.named_endpoints : {}
      Object.keys(named).forEach((endpointName) => apiNames.add(normalizeApiName(endpointName)))
    }
  } catch (_error) {
    // non-fatal: we still have default /predict
  }

  try {
    const openApiResponse = await fetchWithTimeout(`${baseUrl}/gradio_api/openapi.json`, { method: 'GET', headers }, timeoutMs)
    if (openApiResponse.ok) {
      const spec = await openApiResponse.json()
      const paths = spec?.paths && typeof spec.paths === 'object' ? Object.keys(spec.paths) : []
      paths.forEach((pathName) => {
        const match = pathName.match(/^\/gradio_api\/call\/(v2\/)?([^/{]+)$/)
        if (match?.[2]) apiNames.add(normalizeApiName(match[2]))
      })
    }
  } catch (_error) {
    // non-fatal
  }

  const rankedNames = getRankedApiNames([...apiNames])
  const urls = rankedNames.flatMap((apiName) => {
    if (apiName === 'predict') {
      return [
        buildGradioCallUrl({ space, apiName, version: 'v1' }),
        buildGradioCallUrl({ space, apiName, version: 'v2' }),
      ]
    }
    return [
      buildGradioCallUrl({ space, apiName, version: 'v2' }),
      buildGradioCallUrl({ space, apiName, version: 'v1' }),
    ]
  })

  endpointCache.set(space, { createdAt: Date.now(), urls })
  return urls
}
const shouldTryNextEndpoint = (error) => {
  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('fnindexinfererror') ||
    message.includes('could not infer function index') ||
    message.includes('space returned error event') ||
    message.includes('space api call failed') ||
    message.includes('404') ||
    message.includes('500')
  )
}
const runQueueRequest = async ({ predictUrl, headers, timeoutMs, data }) => {
  if (isDebug) console.log(`[HF] POST ${predictUrl} inputs=${Array.isArray(data) ? data.length : 'n/a'}`)
  const isV2Call = predictUrl.includes('/gradio_api/call/v2/')
  const payloadBody = data && typeof data === 'object' && !Array.isArray(data) && (data.v1Data || data.v2Data) ? (isV2Call ? data.v2Data || { data: data.v1Data || [] } : { data: data.v1Data || (data.v2Data ? [data.v2Data] : []) }) : isV2Call && Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === 'object' && !Array.isArray(data[0]) ? data[0] : { data }
  const response = await fetchWithTimeout(
    predictUrl,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payloadBody),
    },
    timeoutMs,
  )
  const responseBody = await readResponseBody(response)
  if (!response.ok) throw new AppError(`Space API call failed (${response.status}): ${extractHttpErrorReason(responseBody)}`, 502)

  const payload = responseBody.parsed || { raw: responseBody.rawText }
  if (isDebug) console.log(`[HF] queue event id: ${payload?.event_id || 'none'}`)
  if (!payload?.event_id) return { raw: payload, sourceUrl: predictUrl }

  const resultResponse = await fetchWithTimeout(`${predictUrl}/${payload.event_id}`, { method: 'GET', headers }, timeoutMs)
  if (!resultResponse.ok) throw new AppError(`Space queue result fetch failed (${resultResponse.status})`, 502)
  const streamText = await resultResponse.text()
  const ssePayload = parseSsePayload(streamText)
  if (ssePayload.event === 'error') throw new AppError(`Space returned error event: ${getSseErrorReason(ssePayload)}`, 502)
  return { raw: ssePayload.data, sourceUrl: predictUrl, eventId: payload.event_id }
}
export const callSpacePrediction = async ({ space, token, apiUrl, timeoutMs, data }) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const discoveredUrls = apiUrl ? [] : await discoverPredictUrls({ space, token, timeoutMs })
  const candidateUrls = [...new Set([...(apiUrl ? [apiUrl] : discoveredUrls), getDefaultPredictUrl(space)])]

  let lastError = null
  for (const predictUrl of candidateUrls) {
    try {
      return await runQueueRequest({ predictUrl, headers, timeoutMs, data })
    } catch (error) {
      lastError = error
      if (isDebug) console.log(`[HF] endpoint failed ${predictUrl}: ${error.message}`)
      if (!shouldTryNextEndpoint(error)) break
    }
  }

  throw new AppError(lastError?.message || 'Space API call failed', lastError?.statusCode || 502)
}
export const getSpaceStatus = async ({ space, token, timeoutMs }) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await fetchWithTimeout(`https://huggingface.co/api/spaces/${space}`, { method: 'GET', headers }, timeoutMs)
  if (!response.ok) throw new AppError(`Failed to fetch status for ${space}`, 502)
  const payload = await response.json()
  return {
    space,
    runtime: payload?.runtime?.stage || payload?.stage || 'unknown',
    sha: payload?.sha || null,
    lastModified: payload?.lastModified || null,
  }
}
