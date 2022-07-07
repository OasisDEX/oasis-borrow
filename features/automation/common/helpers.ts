import BigNumber from 'bignumber.js'

export function resolveMaxBuyOrMinSellPrice(maxBuyOrMinSellPrice: BigNumber) {
  return maxBuyOrMinSellPrice.isZero() ? undefined : maxBuyOrMinSellPrice
}
