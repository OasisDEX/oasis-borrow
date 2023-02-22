import { withSentry } from '@sentry/nextjs'
import { cacheObject } from 'helpers/api/cacheObject'
import { tokenTickers } from 'helpers/api/tokenTickers'
import { NextApiRequest, NextApiResponse } from 'next'

const getTicker = cacheObject(tokenTickers, 2 * 60)

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
