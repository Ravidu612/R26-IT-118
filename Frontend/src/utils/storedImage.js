export const getStoredImageUrl = (record, fallback = '/assets/tea-field-cta.png') => {
  const base64 = record?.imageMeta?.base64
  if (base64) return base64.startsWith('data:') ? base64 : `data:${record.imageMeta.mimeType || 'image/jpeg'};base64,${base64}`
  return record?.result?.annotatedImageUrl || fallback
}
