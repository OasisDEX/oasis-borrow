import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'

import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
  console.log('Rendering ProtectionDetails', id.toString())
  const { stopLossTriggersData$, vault$, collateralPrices$ } = useAppContext()
  const slTriggerData$ = stopLossTriggersData$(id)
  const slTriggerDataWithError = useObservableWithError(slTriggerData$)
  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)

  return (
    <WithLoadingIndicator
      value={[
        slTriggerDataWithError.value,
        vaultDataWithError.value,
        collateralPricesWithError.value,
      ]}
      customLoader={<VaultContainerSpinner />}
    >
      {([triggersData, vaultData, collateralPrices]) => {
        const collateralPrice = collateralPrices.data.filter((x) => x.token === vaultData.token)[0]
        const props: ProtectionDetailsLayoutProps = {
          isStopLossEnabled: triggersData.isStopLossEnabled,
          slRatio: triggersData.stopLossLevel,
          vaultDebt: vaultData.debt,
          currentOraclePrice: collateralPrice.currentPrice,
          nextOraclePrice: collateralPrice.nextPrice,
          lockedCollateral: vaultData.lockedCollateral,
        }
        return <ProtectionDetailsLayout {...props} />
      }}
    </WithLoadingIndicator>
  )
}
