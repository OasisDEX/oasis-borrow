import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { ProductHubView } from 'features/productHub/views'
import {
  refinanceProductHubHiddenColumns,
  refinanceProductHubItemsPerPage,
} from 'features/refinance/constants'
import { useRefinanceContext } from 'features/refinance/contexts'
import {
  getRefinanceProductHubDataParser,
  getRefinanceProductHubSeparator,
} from 'features/refinance/helpers'
import { RefinanceOptions } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React, { useCallback } from 'react'

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
      isShort,
    },
    steps: { setNextStep },
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

  return (
    <ProductHubView
      product={product}
      customSortByDefault={(table) => table}
      dataParser={(table) =>
        getRefinanceProductHubDataParser({
          table,
          interestRates,
          collateralToken,
          collateralAmount,
          debtToken,
          debtAmount,
          isShort,
          refinanceOption,
        })
      }
      hiddenProductTypeSelector
      hiddenCategories
      hiddenHelp
      hiddenTags
      hiddenProtocolFilter
      hiddenNetworkFilter
      perPage={refinanceProductHubItemsPerPage}
      hiddenBanners
      initialFilters={{
        protocol: [LendingProtocol.SparkV3],
        network: [NetworkNames.ethereumMainnet],
      }}
      hiddenColumns={refinanceProductHubHiddenColumns}
      onRowClick={onRowClick}
      wrapperSx={{ mt: 0 }}
      separator={(table) => getRefinanceProductHubSeparator({ table, collateralToken, debtToken })}
    />
  )
}
