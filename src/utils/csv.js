// Builds and downloads a CSV file from an array of header labels and an array of row arrays.
export function exportToCsv(filename, headers, rows) {
  const csvRows = [headers.join(',')]
  rows.forEach((row) => {
    csvRows.push(row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  })
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
