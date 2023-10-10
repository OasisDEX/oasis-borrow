import type BigNumber from 'bignumber.js'
import { noThreshold } from 'features/automation/common/noThreshold'

export function resolveMaxBuyPriceAnalytics({
  withMaxBuyPriceThreshold,
  maxBuyPrice,
}: {
  withMaxBuyPriceThreshold?: boolean
  maxBuyPrice?: BigNumber
}) {
  return !withMaxBuyPriceThreshold ? noThreshold : maxBuyPrice ? maxBuyPrice.toString() : '0'
}
