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
  const key = process.env.COINGECKO_API_KEY
  const baseUrl = key
    ? 'https://pro-api.coingecko.com/api/v3/'
    : 'https://api.coingecko.com/api/v3/'

  const baseHeaders: Record<string, string> = key ? { 'x-cg-pro-api-key': key } : {}
  return axios({
    method: 'get',
    timeout: 1000,
    url: `${baseUrl}/simple/price?ids=${ticker}&vs_currencies=usd`,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
      ...baseHeaders,
    },
  })
}

export async function getCoingeckoTickers(): Promise<PriceServiceResponse> {
  const result = await fetchTicker(requiredTickers.join(','))

  const results: PriceServiceResponse = {}
  requiredTickers.forEach((ticker) => {
    const tickerData = result.data[ticker]
    if (tickerData?.usd) {
      results[ticker] = tickerData.usd
    }
  })
  return results
}
