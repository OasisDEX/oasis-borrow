import { configHandler } from 'handlers/config'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const config = await configHandler()
  const { method } = req
  if (method === 'POST') {
    return res.status(200).json(config?.data ?? { error: 'No config found' })
  }
  return res.status(403).json({ message: 'Not allowed.' })
}
