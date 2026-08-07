import AppError from '../utils/AppError.js'
import { getSpaceBaseUrl } from '../utils/spaceUrl.js'

const uploadWithTimeout = async ({ url, headers, formData, timeoutMs }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { method: 'POST', headers, body: formData, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

export const uploadSpaceFiles = async ({ space, token, files, timeoutMs }) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', new Blob([file.content], { type: file.mimeType }), file.name))
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await uploadWithTimeout({
    url: `${getSpaceBaseUrl(space)}/gradio_api/upload`,
    headers,
    formData,
    timeoutMs,
  })
  const body = await response.text()
  if (!response.ok) throw new AppError(`Space file upload failed (${response.status}): ${body.slice(0, 220)}`, 502)
  let paths
  try {
    paths = JSON.parse(body)
  } catch (_error) {
    throw new AppError('Space file upload returned invalid JSON', 502)
  }
  if (!Array.isArray(paths) || paths.length !== files.length) throw new AppError('Space file upload returned unexpected paths', 502)
  return paths
}
