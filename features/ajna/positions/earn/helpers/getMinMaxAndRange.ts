import BigNumber from 'bignumber.js'
import { WAD_PRECISION } from 'components/constants'
import {
  ajnaDefaultMarketPriceOffset,
  ajnaDefaultPoolRangeMarketPriceOffset,
} from 'features/ajna/common/consts'
import { one, zero } from 'helpers/zero'

export const getMinMaxAndRange = ({
  highestThresholdPrice,
  lowestUtilizedPrice,
  lowestUtilizedPriceIndex,
  mostOptimisticMatchingPrice,
  marketPrice,
  offset, // 0 - 1, percentage value
}: {
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: BigNumber
  mostOptimisticMatchingPrice: BigNumber
  marketPrice: BigNumber
  offset: number
}) => {
  // check whether pool contain liquidity and borrowers, if no generate default range from the lowest price to market price
  if (lowestUtilizedPriceIndex.eq(zero)) {
    const defaultRange = [marketPrice.times(one.minus(ajnaDefaultPoolRangeMarketPriceOffset))]

    while (
      defaultRange[defaultRange.length - 1].lt(
        marketPrice.times(one.minus(ajnaDefaultMarketPriceOffset)),
      )
    ) {
      defaultRange.push(
        defaultRange[defaultRange.length - 1].times(1.005).decimalPlaces(WAD_PRECISION),
      )
    }

    return {
      min: defaultRange[0],
      max: defaultRange[defaultRange.length - 1],
      range: defaultRange,
    }
  }

  // Generate ranges from min to lup
  const lupNearHtpRange = [lowestUtilizedPrice]

  while (lupNearHtpRange[lupNearHtpRange.length - 1].gt(highestThresholdPrice)) {
    lupNearHtpRange.push(lupNearHtpRange[lupNearHtpRange.length - 1].div(1.005))
  }

  const nearHtpMinRange = [lupNearHtpRange[lupNearHtpRange.length - 1]]

  while (
    nearHtpMinRange[nearHtpMinRange.length - 1].gt(nearHtpMinRange[0].times(one.minus(offset)))
  ) {
    nearHtpMinRange.push(nearHtpMinRange[nearHtpMinRange.length - 1].div(1.005))
  }

  // Generate ranges from lup to max
  const lupNearMompRange = [lowestUtilizedPrice]

  while (lupNearMompRange[lupNearMompRange.length - 1].lt(mostOptimisticMatchingPrice)) {
    lupNearMompRange.push(lupNearMompRange[lupNearMompRange.length - 1].times(1.005))
  }

  const nearMompMaxRange = [lupNearMompRange[lupNearMompRange.length - 1]]

  while (
    nearMompMaxRange[nearMompMaxRange.length - 1].lt(nearMompMaxRange[0].times(one.plus(offset)))
  ) {
    nearMompMaxRange.push(nearMompMaxRange[nearMompMaxRange.length - 1].times(1.005))
  }

  const range = [
    ...new Set([...nearHtpMinRange, ...lupNearHtpRange, ...lupNearMompRange, ...nearMompMaxRange]),
  ]
    .sort((a, b) => a.toNumber() - b.toNumber())
    .map((item) => item.decimalPlaces(18))

  return {
    min: range[0],
    max: range[range.length - 1],
    range,
  }
}
