import axios from 'axios'
import { tokens } from 'blockchain/tokensMetadata'
import { PriceServiceResponse } from 'helpers/types'

interface CoingeckoApiResponse {
  [id: string]: { usd: number }
}

const requiredTickers = tokens
  .filter((token) => token.coinGeckoTicker)
  .map((token) => token.coinGeckoTicker) as string[]

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

  const mappedResult = result
    .filter((res) => res.status === 'fulfilled')
    .map(
      (res, index) =>
        (res as PromiseFulfilledResult<{ data: CoingeckoApiResponse }>).value.data[
          requiredTickers[index]
        ],
    )

  return mappedResult.reduce((acc, res, idx) => {
    return {
      ...acc,
      [requiredTickers[idx]]: res.usd,
    }
  }, {})
}
