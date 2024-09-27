import { getNetworkById } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubView, type ProductHubViewProps } from 'features/productHub/views'
import {
  refinanceCustomProductHubFiltersOptions,
  refinanceProductHubHiddenColumns,
  refinanceProductHubItemsPerPage,
} from 'features/refinance/constants'
import { useRefinanceContext } from 'features/refinance/contexts'
import {
  getRefinanceProductHubDataParser,
  getRefinanceProductHubSeparator,
} from 'features/refinance/helpers'
import { getRefinanceStrategiesToBeFiltered } from 'features/refinance/helpers/getRefinanceStrategiesToBeFiltered'
import { RefinanceOptions } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React, { useCallback } from 'react'

export type ProductHubItemRefinance = ProductHubItem & {
  netApy?: string
}

export const RefinanceProductTableStep = () => {
  const {
    metadata: { interestRates },
    form: {
      state: { refinanceOption },
      updateState,
    },
    position: {
      collateralTokenData: {
        amount: collateralAmount,
        token: { symbol: collateralToken },
      },
      debtTokenData: {
        amount: debtAmount,
        token: { symbol: debtToken },
      },
      ltv,
      isShort,
      lendingProtocol,
    },
    steps: { setNextStep },
    environment: { chainInfo, dpmEvents },
  } = useRefinanceContext()

  const onRowClick = useCallback(
    (item) => {
      updateState('strategy', item)
      setNextStep()
    },
    [updateState, setNextStep],
  )

  if (!refinanceOption) {
    return null
  }

  const product = {
    [RefinanceOptions.HIGHER_LTV]: OmniProductType.Borrow,
    [RefinanceOptions.LOWER_COST]: OmniProductType.Borrow,
    [RefinanceOptions.CHANGE_DIRECTION]: OmniProductType.Borrow,
    [RefinanceOptions.SWITCH_TO_EARN]: OmniProductType.Earn,
  }[refinanceOption]

  const currentLTV = ltv.loanToValue.toString()
  const network = getNetworkById(chainInfo.chainId)

  return (
    <ProductHubView<ProductHubViewProps<ProductHubItemRefinance>>
      product={product}
      customSortByDefault={(table) => table}
      dataParser={(table) =>
        getRefinanceProductHubDataParser({
          table: getRefinanceStrategiesToBeFiltered({ events: dpmEvents.positions, table }),
          interestRates,
          collateralToken,
          collateralAmount,
          debtToken,
          debtAmount,
          isShort,
          refinanceOption,
          currentLTV,
        })
      }
      hiddenProductTypeSelector
      hiddenCategories
      hiddenHelp
      hiddenTags
      hiddenNetworkFilter
      perPage={refinanceProductHubItemsPerPage}
      hiddenBanners
      initialFilters={{
        protocol: lendingProtocol === LendingProtocol.SparkV3 ? [LendingProtocol.AaveV3] : [],
        network: [network.name],
      }}
      hiddenColumns={refinanceProductHubHiddenColumns}
      onRowClick={onRowClick}
      wrapperSx={{ mt: 0 }}
      separator={(table) => getRefinanceProductHubSeparator({ table, collateralToken, debtToken })}
      customFiltersOptions={refinanceCustomProductHubFiltersOptions[lendingProtocol]}
    />
  )
}
