import axios from 'axios'
import { tokens } from 'blockchain/token-metadata-list/tokens'
import type { TokenConfig } from 'blockchain/TokenConfig'
import type { PriceServiceResponse, RequiredField } from 'helpers/types'

interface CoinbaseApiResponse {
  ask: string
  bid: string
  volume: string
  trade_id: number
  price: string
  size: string
  time: Date
}

const requiredTickers = tokens
  .filter((token): token is RequiredField<TokenConfig, 'coinbaseTicker'> => !!token.coinbaseTicker)
  .map((token) => token.coinbaseTicker)

async function fetchTicker(product_id: string): Promise<{ data: CoinbaseApiResponse }> {
  return axios({
    method: 'get',
    timeout: 1000,
    url: `https://api.pro.coinbase.com/products/${product_id}/ticker`,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function getCoinbaseTickers(): Promise<PriceServiceResponse> {
  const result = await Promise.allSettled(requiredTickers.map((ticker) => fetchTicker(ticker)))

  // Need to map over all results to ensure ticker order is preserved
  return result
    .map((res, idx) => ({
      ...(res.status === 'fulfilled' ? { ...res.value.data } : {}),
      ticker: requiredTickers[idx],
    }))
    .reduce((acc, res) => {
      // If the price is not available, we don't want to add it to the result
      if (!res.price) {
        return acc
      }
      return {
        ...acc,
        [res.ticker]: Number(res.price),
      }
    }, {})
}
