import BigNumber from 'bignumber.js'
import { getNetworkByName } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import { isShortPosition } from 'features/omni-kit/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import type { RefinanceInterestRatesMetadata } from 'features/refinance/helpers/getRefinanceAaveLikeInterestRates'
import { RefinanceOptions } from 'features/refinance/types'
import { moveItemsToFront } from 'helpers/moveItemsToFront'

const availableLiquidityMapping = ({
  table,
  debtAmount,
  debtToken,
}: {
  table: ProductHubItem[]
  debtAmount: string
  debtToken: string
}) => {
  const debtPrice = getTokenPrice(
    debtToken,
    tokenPriceStore.prices,
    'debtPrice - availableLiquidityMapping',
  )
  const positionDebtInUsd = debtPrice.times(debtAmount)

  // no positions with liquidity less than 5% more than outstanding debt should be surfaced
  // if item.liquidity doesn't exist it means that liquidity is unlimited
  return table.filter((item) =>
    item.liquidity ? new BigNumber(item.liquidity).times(0.95).gte(positionDebtInUsd) : true,
  )
}

const borrowRateMapping = ({
  table,
  interestRates,
  collateralAmount,
  debtAmount,
}: {
  table: ProductHubItem[]
  interestRates: RefinanceInterestRatesMetadata
  collateralAmount: string
  debtAmount: string
}) =>
  table.map((item) => {
    const network = getNetworkByName(item.network)
    const protocol = item.protocol

    const customCollateralRates = interestRates[network.id]?.[protocol]?.[item.primaryToken]
    const customDebtRates = interestRates[network.id]?.[protocol]?.[item.secondaryToken]

    if (customCollateralRates && customDebtRates) {
      const collateralPrice = getTokenPrice(
        item.primaryToken,
        tokenPriceStore.prices,
        'collateral price - borrowRateMapping',
      )
      const debtPrice = getTokenPrice(
        item.secondaryToken,
        tokenPriceStore.prices,
        'debt price - borrowRateMapping',
      )

      const netValue = new BigNumber(collateralAmount)
        .times(collateralPrice)
        .minus(new BigNumber(debtAmount).times(debtPrice))

      return {
        ...item,
        fee: new BigNumber(customDebtRates.borrowVariable)
          .times(debtAmount)
          .times(debtPrice)
          .minus(
            new BigNumber(customCollateralRates.lendVariable)
              .times(collateralAmount)
              .times(collateralPrice),
          )
          .div(netValue)
          .toString(),
      }
    }

    return item
  })

const sortMapping = ({ refinanceOption }: { refinanceOption: RefinanceOptions }) =>
  ({
    [RefinanceOptions.HIGHER_LTV]: (a: ProductHubItem, b: ProductHubItem) =>
      Number(b?.maxLtv) - Number(a?.maxLtv),
    [RefinanceOptions.LOWER_COST]: (a: ProductHubItem, b: ProductHubItem) =>
      Number(a?.fee) - Number(b?.fee),
    [RefinanceOptions.CHANGE_DIRECTION]: undefined,
    [RefinanceOptions.SWITCH_TO_EARN]: undefined,
  })[refinanceOption]

const changeDirectionMapping = ({
  refinanceOption,
  table,
  isShort,
}: {
  refinanceOption: RefinanceOptions
  table: ProductHubItem[]
  isShort: boolean
}) =>
  refinanceOption === RefinanceOptions.CHANGE_DIRECTION
    ? table.filter((item) =>
        isShort
          ? !isShortPosition({ collateralToken: item.primaryToken })
          : isShortPosition({ collateralToken: item.primaryToken }),
      )
    : table

export const getRefinanceProductHubDataParser = ({
  table,
  interestRates,
  collateralAmount,
  debtAmount,
  refinanceOption,
  isShort,
  collateralToken,
  debtToken,
}: {
  table: ProductHubItem[]
  interestRates: RefinanceInterestRatesMetadata
  collateralAmount: string
  debtAmount: string
  refinanceOption: RefinanceOptions
  isShort: boolean
  collateralToken: string
  debtToken: string
}) => {
  // Map only items with enough liquidity to perform refinance
  const availableLiquidityMapped = availableLiquidityMapping({ table, debtAmount, debtToken })

  // Overwrite borrow rates from PH (which are per pool, not per position) for aave-like protocols
  const borrowRatesMapped = borrowRateMapping({
    table: availableLiquidityMapped,
    interestRates,
    collateralAmount,
    debtAmount,
  })

  // Sort per specific refinance option
  const sortMapped = sortMapping({ refinanceOption })

  const theSamePairInFrontMapped = moveItemsToFront(
    borrowRatesMapped,
    (item) => item.primaryToken === collateralToken && item.secondaryToken === debtToken,
    sortMapped,
  )

  // Filter out long / short strategies if user wants to switch direction
  return changeDirectionMapping({
    refinanceOption,
    isShort,
    table: theSamePairInFrontMapped,
  })
}
