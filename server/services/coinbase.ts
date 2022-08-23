import axios from 'axios'
import { tokens } from 'blockchain/tokensMetadata'
import { PriceServiceResponse } from 'helpers/types'

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
  .filter((token) => token.coinbaseTicker)
  .map((token) => token.coinbaseTicker) as any[]

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

  const mappedResult = result
    .filter((res) => res.status === 'fulfilled')
    .map((res) => (res as PromiseFulfilledResult<{ data: CoinbaseApiResponse }>).value.data)
    .map((res, idx) => ({ ...res, ticker: requiredTickers[idx] }))

  return mappedResult.reduce((acc, res) => {
    return {
      ...acc,
      [res.ticker]: Number(res.price),
    }
  }, {})
}
