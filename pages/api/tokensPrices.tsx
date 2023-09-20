import { cacheObject } from 'helpers/api/cacheObject'
import { tokenTickers } from 'helpers/api/tokenTickers'
import type { NextApiRequest, NextApiResponse } from 'next'

export const getTicker = cacheObject(tokenTickers, 2 * 60, 'token-tickers')

async function tokensPricesHandler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const tickers = await getTicker()
        if (tickers?.data) {
          res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=119')
          return res.status(200).json(tickers.data)
        }

        return res.status(500).json({ error: 'Token tickers unavailable' })
      } catch (e) {
        console.error(e)
        return res.status(500).end()
      }
    default:
      return res.status(405).end()
  }
}

export default tokensPricesHandler
