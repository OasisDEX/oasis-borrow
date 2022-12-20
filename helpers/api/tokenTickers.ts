import { getCoinbaseTickers } from 'server/services/coinbase'
import { getCoingeckoTickers } from 'server/services/coingecko'
import { getCoinPaprikaTickers } from 'server/services/coinPaprika'

import devResponse from './devResponse.json'

export async function tokenTickers() {
  const results = await Promise.all([
    getCoinPaprikaTickers(),
    getCoinbaseTickers(),
    getCoingeckoTickers(),
  ])
  const mergedTickers = results.reduce((acc, el) => ({ ...acc, ...el }), {})

  return mergedTickers
}
