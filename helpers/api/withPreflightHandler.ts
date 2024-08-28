import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export const withPreflightHandler =
  (handler: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }
    return handler(req, res)
  }
