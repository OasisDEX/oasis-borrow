import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { ProductHubView } from 'features/productHub/views'
import { useRefinanceContext } from 'features/refinance/contexts'
import { getRefinanceProductHubDataParser } from 'features/refinance/helpers'
import { RefinanceOptions } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinanceProductTableStep = () => {
  const {
    environment: {
      marketPrices: { debtPrice, collateralPrice },
    },
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
          collateralPrice,
          collateralToken,
          collateralAmount,
          debtPrice,
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
      perPage={5}
      hiddenBanners
      initialFilters={{
        protocol: [LendingProtocol.SparkV3],
        network: [NetworkNames.ethereumMainnet],
      }}
      hiddenColumns={['automation', '7DayNetApy']}
      onRowClick={(item) => {
        updateState('strategy', item)
        setNextStep()
      }}
      wrapperSx={{ mt: 0 }}
    />
  )
}
