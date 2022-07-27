import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

import { cacheObject } from '../../helpers/cacheObject'
import { getTokenTickers } from '../../helpers/getTokenTickers'

const getTicker = cacheObject(getTokenTickers, 2 * 60)

async function tokensPricesHandler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const tickers = await getTicker()
      res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=119')
      return res.status(200).json(tickers.data)
    default:
      return res.status(405).end()
  }
}

export default withSentry(tokensPricesHandler)
