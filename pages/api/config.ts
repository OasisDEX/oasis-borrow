import { cacheObject } from 'helpers/api/cacheObject'
import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'

const configUrl = getConfig()?.publicRuntimeConfig?.configUrl

const configFetcher = async function () {
  const response = await fetch(configUrl)
  const data = await response.json()
  return data
}

const cachedConfig = cacheObject<Record<string, string>>(configFetcher, 60, 'config-cache')

const configHandler = async function (req: NextApiRequest, res: NextApiResponse) {
  const config = await cachedConfig()
  const { headers, method } = req
  if (method === 'POST') {
    return res.status(200).json(config?.data || { error: 'No config found' })
  }
  if (method === 'PATCH') {
    if ([undefined, ''].includes(process.env.CONFIG_KEY)) {
      return res.status(400).json({
        errorMessage: 'Missing env variable',
      })
    }
    if (headers.authorization !== process.env.CONFIG_KEY) {
      return res.status(400).json({
        errorMessage: 'Missing header parameter',
      })
    }
    return res.status(200).json(config?.data || { error: 'No config found (on PATCH)' })
  }
  return res.status(403).json({ message: 'Not allowed.' })
}

export default configHandler
