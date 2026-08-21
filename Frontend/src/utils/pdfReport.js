const pageLineLimit = 44

export function downloadReportPdf({ predictions, tasks, fromDate, toDate, searchText }) {
  const lines = buildReportLines({ predictions, tasks, fromDate, toDate, searchText })
  const pdf = createPdfDocument(chunk(lines, pageLineLimit))
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `teaguard-report-${Date.now()}.pdf`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function buildReportLines({ predictions, tasks, fromDate, toDate, searchText }) {
  const lines = [
    'TeaGuard AI - Prediction Report',
    `Generated: ${new Date().toLocaleString()}`,
    `Date range: ${fromDate || 'All'} to ${toDate || 'All'}`,
    `Search: ${searchText || 'All prediction records'}`,
    '',
    `Prediction Summary (${predictions.length} records)`,
    `Task assignment records: ${tasks.length}`,
    '',
    'Date | Module | Result | Confidence | Status',
    '-'.repeat(95),
  ]
  predictions.forEach((item, index) => {
    const result = getResultLabel(item)
    const confidence = item.result?.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : '-'
    const status = item.result?.statusMessage || 'Completed'
    lines.push(`${index + 1}. ${new Date(item.createdAt).toLocaleString()} | ${item.moduleType.replaceAll('_', ' ')} | ${result} | ${confidence} | ${status}`)
  })
  return lines.flatMap((line) => wrapLine(line, 105))
}

function getResultLabel(item) {
  return item.result?.predicted_disease || item.result?.predicted_grade || item.result?.predicted_state || item.result?.detectedClass || (item.result?.detected ? 'tea leaf detected' : 'not detected')
}

function wrapLine(line, maxLength) {
  if (!line) return ['']
  const words = line.split(' ')
  const lines = []
  let current = ''
  words.forEach((word) => {
    if (`${current} ${word}`.trim().length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = `${current} ${word}`.trim()
    }
  })
  if (current) lines.push(current)
  return lines
}

function chunk(lines, size) {
  const pages = []
  for (let index = 0; index < lines.length; index += size) pages.push(lines.slice(index, index + size))
  return pages.length ? pages : [['No prediction records found.']]
}

function createPdfDocument(pages) {
  const objects = []
  const addObject = (value) => { objects.push(value); return objects.length }
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const pagesId = addObject('')
  const pageIds = pages.map((lines) => {
    const stream = buildPageStream(lines)
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    return addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`)
  })
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  let output = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(output).length)
    output += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = new TextEncoder().encode(output).length
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return output
}

function buildPageStream(lines) {
  const commands = ['BT', '/F1 10 Tf', '50 750 Td']
  lines.forEach((line, index) => {
    if (index) commands.push('0 -15 Td')
    commands.push(`(${escapePdfText(line)}) Tj`)
  })
  commands.push('ET')
  return commands.join('\n')
}

function escapePdfText(value) {
  return String(value).replace(/[^\x20-\x7E]/g, '?').replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}
