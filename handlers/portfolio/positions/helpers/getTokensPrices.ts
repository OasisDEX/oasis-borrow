import BigNumber from 'bignumber.js'
import { getTokenPrice, getTokenPriceSources } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { tokensBySymbol } from 'blockchain/tokensMetadata.constants'
import { tokenTickers } from 'helpers/api/tokenTickers'

export interface TokensPrices {
  [key: string]: number
}

export async function getTokensPrices(): Promise<TokensPrices> {
  const tickersResponse = await tokenTickers()
  const tickers = Object.entries(tickersResponse).reduce<Tickers>(
    (acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: new BigNumber(value),
    }),
    {},
  )

  try {
    return Object.keys(tokensBySymbol)
      .filter((key) => getTokenPriceSources(key).filter((item) => item !== undefined).length)
      .reduce<TokensPrices>(
        (result, current) => ({
          ...result,
          [current]: getTokenPrice(current, tickers).toNumber(),
        }),
        {},
      )
  } catch (e) {
    console.info('Error loading one of the prices')
    console.info(e)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return await getTokensPrices()
  }
}
