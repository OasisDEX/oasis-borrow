import BigNumber from 'bignumber.js'
import { getNetworkByName, NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { ProductHubView } from 'features/productHub/views'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceOptions } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinanceProductTableStep = () => {
  const {
    environment: { debtPrice, collateralPrice },
    metadata: { interestRates },
    form: {
      state: { refinanceOption },
      updateState,
    },
    position: {
      collateralTokenData: { amount: collateralAmount },
      debtTokenData: { amount: debtAmount },
    },
    steps: { setNextStep },
  } = useRefinanceContext()

  const product = {
    [RefinanceOptions.HIGHER_LTV]: OmniProductType.Borrow,
    [RefinanceOptions.LOWER_COST]: OmniProductType.Borrow,
    [RefinanceOptions.CHANGE_DIRECTION]: OmniProductType.Borrow,
    [RefinanceOptions.SWITCH_TO_EARN]: OmniProductType.Earn,
  }[refinanceOption || RefinanceOptions.LOWER_COST]

  return (
    <ProductHubView
      product={product}
      dataParser={(table) => {
        // WIP version, will be extracted and extended
        return table.map((item) => {
          const network = getNetworkByName(item.network)
          const protocol = item.protocol

          const customCollateralRates = interestRates[network.id]?.[protocol]?.[item.primaryToken]
          const customDebtRates = interestRates[network.id]?.[protocol]?.[item.secondaryToken]

          const netValue = new BigNumber(collateralAmount)
            .times(collateralPrice)
            .minus(new BigNumber(debtAmount).times(debtPrice))

          if (customCollateralRates && customDebtRates) {
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
      }}
      hiddenProductTypeSelector
      hiddenCategories
      hiddenHelp
      hiddenTags
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
    />
  )
}
