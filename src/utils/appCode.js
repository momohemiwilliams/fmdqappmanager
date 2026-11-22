export function deriveAppCode(appName = '') {
  const words = appName
    .split(/[\s/]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean)

  if (!words.length) return 'APP'

  const code = words.map((word) => word[0].toUpperCase()).join('')
  return code.slice(0, 6)
}
