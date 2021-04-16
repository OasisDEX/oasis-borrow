import getConfig from 'next/config'

const config = getConfig()

export function staticFilesRuntimeUrl(filePath: string) {
  return `${config?.publicRuntimeConfig.basePath || ''}${filePath}`
}
