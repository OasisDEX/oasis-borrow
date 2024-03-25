import type BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import type { OmniExtraTokenData } from 'features/omni-kit/types'

interface GetOmniExtraTokenDataParams {
  extraBalances: BigNumber[]
  extraTokens: string[]
  protocolPrices: Tickers
}

export function getOmniExtraTokenData({
  extraBalances,
  extraTokens,
  protocolPrices,
}: GetOmniExtraTokenDataParams) {
  return extraTokens.reduce<OmniExtraTokenData>(
    (total, current, i) => ({
      ...total,
      [current]: {
        price: protocolPrices[current],
        balance: extraBalances[i],
      },
    }),
    {},
  )
}
