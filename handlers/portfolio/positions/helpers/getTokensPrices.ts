import BigNumber from 'bignumber.js'
import { getTokenPrice, getTokenPriceSources } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { tokensBySymbol } from 'blockchain/tokensMetadata.constants'
import { tokenTickers } from 'helpers/api/tokenTickers'

const MAX_RETRIES = 5

export interface TokensPricesList {
  [key: string]: number
}

export interface TokensPrices {
  tokens?: TokensPricesList
  error?: string
}

export async function getTokensPrices(retries: number = 0): Promise<TokensPrices> {
  const tickersResponse = await tokenTickers()
  const tickers = Object.entries(tickersResponse).reduce<Tickers>(
    (acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: new BigNumber(value as any),
    }),
    {},
  )

  try {
    return {
      tokens: Object.keys(tokensBySymbol)
        .filter((key) => getTokenPriceSources(key).filter((item) => item !== undefined).length)
        .reduce<{ [key: string]: number }>((result, current) => {
          let value = new BigNumber(0)
          try {
            value = getTokenPrice(current, tickers, 'getTokensPrices')
          } catch (e) {
            // When ticker value is not found we will log error and fallback to 0
            console.error('Error getTokenPrice for token: ' + current)
          }

          return {
            ...result,
            [current]: value.toNumber(),
          }
        }, {}),
    }
  } catch (e) {
    console.info('Error loading one of the prices')
    console.info(e)

    if (retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return await getTokensPrices(retries + 1)
    } else {
      return { error: (e as string).toString() }
    }
  }
}
