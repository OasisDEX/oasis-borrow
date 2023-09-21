import axios from 'axios'
import { tokens } from 'blockchain/token-metadata-list/tokens'
import type { PriceServiceResponse } from 'helpers/types'

interface CoinPaprikaApiResponse {
  id: string
  name: string
  symbol: string
  rank: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  beta_value: number
  first_data_at: Date
  last_updated: Date
  quotes: Quotes
}

export interface Quotes {
  USD: Quote
}

export interface Quote {
  price: number
  volume_24h: number
  volume_24h_change_24h: number
  market_cap: number
  market_cap_change_24h: number
  percent_change_15m: number
  percent_change_30m: number
  percent_change_1h: number
  percent_change_6h: number
  percent_change_12h: number
  percent_change_24h: number
  percent_change_7d: number
  percent_change_30d: number
  percent_change_1y: number
  ath_price: number
  ath_date: Date
  percent_from_price_ath: number
}

const requiredTickers = tokens
  .filter((token) => token.coinpaprikaTicker)
  .map((token) => token.coinpaprikaTicker) as string[]

function fetchTicker(): Promise<{ data: CoinPaprikaApiResponse[] }> {
  return axios({
    method: 'get',
    timeout: 1000,
    url: `${process.env.COINPAPRIKA_API_URL}/tickers`,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
      Authorization: `${process.env.COINPAPRIKA_API_KEY}`,
    },
  })
}

function fetchTickersWithRetry(
  retries = 3,
  err = null,
): Promise<{ data: CoinPaprikaApiResponse[] }> {
  if (!retries) {
    return Promise.reject(err)
  }
  return fetchTicker().catch((err) => {
    return fetchTickersWithRetry(retries - 1, err)
  })
}

export async function getCoinPaprikaTickers(): Promise<PriceServiceResponse> {
  const result = await fetchTickersWithRetry()

  return result.data
    .filter((response: CoinPaprikaApiResponse) => requiredTickers.includes(response.id))
    .reduce((acc, res) => {
      return {
        ...acc,
        [res.id]: res.quotes.USD.price,
      }
    }, {})
}
