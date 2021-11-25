import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'

import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
  const { stopLossTriggersData$, vault$, collateralPrices$, ilkDataList$ } = useAppContext()
  const slTriggerData$ = stopLossTriggersData$(id)
  const slTriggerDataWithError = useObservableWithError(slTriggerData$)
  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)
  const ilksDataWithError = useObservableWithError(ilkDataList$)

  return (
    <WithErrorHandler
      error={[
        slTriggerDataWithError.error,
        vaultDataWithError.error,
        collateralPricesWithError.error,
        ilksDataWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          slTriggerDataWithError.value,
          vaultDataWithError.value,
          collateralPricesWithError.value,
          ilksDataWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([triggersData, vaultData, collateralPrices, ilkDataList]) => {
          const ilk = ilkDataList.filter((x) => x.ilk === vaultData.ilk)[0]
          const collateralPrice = collateralPrices.data.filter(
            (x) => x.token === vaultData.token,
          )[0]
          const XYZ = new BigNumber('1') // this value should be replaced with correct value from protection state

          const props: ProtectionDetailsLayoutProps = {
            isStopLossEnabled: triggersData.isStopLossEnabled,
            slRatio: triggersData.stopLossLevel,
            vaultDebt: vaultData.debt,
            currentOraclePrice: collateralPrice.currentPrice,
            nextOraclePrice: collateralPrice.nextPrice,
            lockedCollateral: vaultData.lockedCollateral,

            liquidationRatio: ilk.liquidationRatio,
            isStaticPrice: collateralPrice.isStaticPrice,
            token: vaultData.token,

            // protectionState mocked for now
            protectionState: {
              inputAmountsEmpty: true,
              stage: 'editing',
              afterSlRatio: XYZ,
              afterDebt: XYZ,
              afterLiquidationPrice: XYZ,
              afterLockedCollateral: XYZ,
            },
          }
          return <ProtectionDetailsLayout {...props} />
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
