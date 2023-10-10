import axios from 'axios'
import { tokens } from 'blockchain/token-metadata-list/tokens'
import type { TokenConfig } from 'blockchain/TokenConfig'
import type { PriceServiceResponse, RequiredField } from 'helpers/types'

interface CoingeckoApiResponse {
  [id: string]: { usd: number }
}

const requiredTickers = tokens
  .filter(
    (token): token is RequiredField<TokenConfig, 'coinGeckoTicker'> => !!token.coinGeckoTicker,
  )
  .map((token) => token.coinGeckoTicker)

async function fetchTicker(ticker: string): Promise<{ data: CoingeckoApiResponse }> {
  return axios({
    method: 'get',
    timeout: 1000,
    url: `https://api.coingecko.com/api/v3/simple/price?ids=${ticker}&vs_currencies=usd`,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function getCoingeckoTickers(): Promise<PriceServiceResponse> {
  const result = await Promise.allSettled(requiredTickers.map((ticker) => fetchTicker(ticker)))

  // Need to map over all results to ensure ticker order is preserved
  return result
    .map((res, idx) => ({
      ...(res.status === 'fulfilled' ? { ...res.value.data[requiredTickers[idx]] } : {}),
      ticker: requiredTickers[idx],
    }))
    .reduce((acc, res) => {
      // If the price is not available, we don't want to add it to the result
      if (!res.usd) {
        return acc
      }
      return {
        ...acc,
        [res.ticker]: res.usd,
      }
    }, {})
}
