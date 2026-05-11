import { useCallback, useEffect, useState } from 'react'

export function useApi(apiFn, { immediate = true, defaultData = null } = {}) {
  const [data, setData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(immediate)
  const [error, setError] = useState('')

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true)
      setError('')
      try {
        const result = await apiFn(...args)
        setData(result)
        return result
      } catch (apiError) {
        const message = apiError?.message || 'Unable to complete request'
        setError(message)
        throw apiError
      } finally {
        setIsLoading(false)
      }
    },
    [apiFn],
  )

  useEffect(() => {
    if (!immediate) return undefined
    const timerId = setTimeout(() => {
      execute().catch(() => {})
    }, 0)
    return () => clearTimeout(timerId)
  }, [execute, immediate])

  return { data, isLoading, error, execute, setData, setError }
}
