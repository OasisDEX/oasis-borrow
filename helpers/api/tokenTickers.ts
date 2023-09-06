import { getCoinbaseTickers } from 'server/services/coinbase'
import { getCoingeckoTickers } from 'server/services/coingecko'
import { getCoinPaprikaTickers } from 'server/services/coinPaprika'
import { getSDaiOracleTicker } from 'server/services/sdaiOracle'

export async function tokenTickers() {
  const results = await Promise.all([
    getCoinPaprikaTickers(),
    getCoinbaseTickers(),
    getCoingeckoTickers(),
    getSDaiOracleTicker(),
  ])

  // Merge prices from all services into one tickers blob
  return results.reduce((acc, el) => ({ ...acc, ...el }), {})
}
