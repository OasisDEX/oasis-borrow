export function svgStringToBase64(svgString?: string) {
  if (!svgString) return ''
  return Buffer.from(svgString).toString('base64')
}
