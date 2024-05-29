import { getNetworkById } from 'blockchain/networks'
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
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import React, { useCallback } from 'react'
import { FeaturesEnum } from 'types/config'

const customFiltersOptions = {
  protocols: [
    {
      label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
      value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
      image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
    },
    {
      label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
      value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
      image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
      featureFlag: FeaturesEnum.MorphoBlue,
    },
    {
      label: lendingProtocolsByName[LendingProtocol.SparkV3].label,
      value: lendingProtocolsByName[LendingProtocol.SparkV3].name,
      image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
    },
  ],
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
    environment: { chainInfo },
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

  const optionalProps =
    lendingProtocol === LendingProtocol.Maker
      ? { hiddenProtocolFilter: true } // hiding protocol filter as maker can only refinance to spark
      : { customFiltersOptions }

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
        protocol: [
          lendingProtocol === LendingProtocol.SparkV3
            ? LendingProtocol.AaveV3
            : LendingProtocol.SparkV3,
        ],
        network: [network.name],
      }}
      hiddenColumns={refinanceProductHubHiddenColumns}
      onRowClick={onRowClick}
      wrapperSx={{ mt: 0 }}
      separator={(table) => getRefinanceProductHubSeparator({ table, collateralToken, debtToken })}
      {...optionalProps}
    />
  )
}
