import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getTickers } from 'server/services/coinPaprica'
import * as z from 'zod'

import { cacheObject } from '../../helpers/cacheObject'

const getTicker = cacheObject(getTickers, 2 * 60)

const paramsSchema = z.object({
  coinpaprikaTicker: z.string(),
})

async function tokensPricesHandler(req: NextApiRequest, res: NextApiResponse) {
  const { coinpaprikaTicker } = paramsSchema.parse(req.query)

  switch (req.method) {
    case 'GET':
      const tickers = await getTicker()
      const price = tickers.hasOwnProperty(coinpaprikaTicker) ? tickers[coinpaprikaTicker] : '0'
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=90, stale-while-revalidate=119')
      return res.status(200).json({ price: price })
    default:
      return res.status(405).end()
  }
}

export default withSentry(tokensPricesHandler)
