import type BigNumber from 'bignumber.js'
import { noThreshold } from 'features/automation/common/noThreshold'

export function resolveMinSellPriceAnalytics({
  withMinSellPriceThreshold,
  minSellPrice,
}: {
  withMinSellPriceThreshold?: boolean
  minSellPrice?: BigNumber
}) {
  return !withMinSellPriceThreshold ? noThreshold : minSellPrice ? minSellPrice.toString() : '0'
}
