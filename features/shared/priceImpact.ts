import BigNumber from 'bignumber.js'

/**
 *
 * @param marketPrice - This price represent how much it will cost for selling some very small amount
 * such as 0.1. It is the best possible price on the market.
 * @param offerPrice - If the amount we would like to sell we might get deeper into the liquidity
 * meaning the price won't be a good as when you sell small amount. This is the price that is
 * represent how much it will cost for us to sell the desired amount.
 *
 * Both prices might be equal which means that there is no price impact. Having no
 * price impact means that you sell at the best possible price.
 */
export function calculatePriceImpact(marketPrice: BigNumber, offerPrice: BigNumber) {
  return marketPrice.minus(offerPrice).div(marketPrice).abs().times(100)
}
