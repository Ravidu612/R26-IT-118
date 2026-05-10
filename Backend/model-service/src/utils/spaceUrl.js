export const getSpaceSubdomain = (space) => space.replace('/', '-').replace(/_/g, '-').toLowerCase()

export const getSpaceBaseUrl = (space) => `https://${getSpaceSubdomain(space)}.hf.space`

export const normalizeApiName = (apiName = 'predict') => String(apiName).replace(/^\/+/, '').trim() || 'predict'

export const buildGradioCallUrl = ({ space, apiName = 'predict', version = 'v1' }) => {
  const baseUrl = getSpaceBaseUrl(space)
  const endpointName = normalizeApiName(apiName)
  const callPrefix = version === 'v2' ? '/gradio_api/call/v2' : '/gradio_api/call'
  return `${baseUrl}${callPrefix}/${endpointName}`
}

export const getDefaultPredictUrl = (space) => buildGradioCallUrl({ space, apiName: 'predict', version: 'v1' })
