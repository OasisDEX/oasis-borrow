import BigNumber from 'bignumber.js'
import { getNetworkByName } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import { isShortPosition } from 'features/omni-kit/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import type { RefinanceInterestRatesMetadata } from 'features/refinance/graph/getRefinanceTargetInterestRates'
import { RefinanceOptions } from 'features/refinance/types'
import { aaveLikeAprToApy } from 'handlers/product-hub/helpers'
import { moveItemsToFront } from 'helpers/moveItemsToFront'
import { LendingProtocol } from 'lendingProtocols'

import { getNetAPY } from './getNetAPY'

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
  currentLTV,
}: {
  table: ProductHubItem[]
  interestRates: RefinanceInterestRatesMetadata
  currentLTV: string
}) =>
  table.map((item) => {
    const network = getNetworkByName(item.network)

    const customCollateralRates = interestRates[network.id]?.[item.protocol]?.[item.primaryToken]
    const customDebtRates = interestRates[network.id]?.[item.protocol]?.[item.secondaryToken]

    // there are no rates so not possible to calculate apys
    if (!customCollateralRates || !customDebtRates) {
      return item
    }

    const borrowApy = aaveLikeAprToApy(customDebtRates.borrowVariable)
    const lendApy = aaveLikeAprToApy(customCollateralRates.lendVariable)
    const netApy = getNetAPY(currentLTV, borrowApy, lendApy)

    return {
      ...item,
      netApy,
    }
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
  debtAmount,
  refinanceOption,
  isShort,
  collateralToken,
  debtToken,
  currentLTV,
}: {
  table: ProductHubItem[]
  interestRates: RefinanceInterestRatesMetadata
  collateralAmount: string
  debtAmount: string
  refinanceOption: RefinanceOptions
  isShort: boolean
  collateralToken: string
  debtToken: string
  currentLTV: string
}) => {
  const filteredRowsByProtocol = table
    // filter Ajna as it's not supported in refinance
    .filter((item) => item.protocol !== LendingProtocol.Ajna)
    // filter Maker as it's not supported as target in refinance
    .filter((item) => item.protocol !== LendingProtocol.Maker)

  // Map only items with enough liquidity to perform refinance
  const availableLiquidityMapped = availableLiquidityMapping({
    table: filteredRowsByProtocol,
    debtAmount,
    debtToken,
  })

  // Overwrite borrow rates from PH (which are per pool, not per position) for aave-like protocols
  const borrowRatesMapped = borrowRateMapping({
    table: availableLiquidityMapped,
    interestRates,
    currentLTV,
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
