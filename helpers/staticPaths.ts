import getConfig from 'next/config'

const { basePath } = getConfig()

export function staticFilesRuntimeUrl(filePath: string) {
  return `${basePath || ''}${filePath}`
}
