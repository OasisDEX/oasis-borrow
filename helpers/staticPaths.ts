import getConfig from 'next/config'

const config = getConfig()

export function staticFilesRuntimeUrl(filePath: string) {
  return `${config?.basePath || ''}${filePath}`
}
