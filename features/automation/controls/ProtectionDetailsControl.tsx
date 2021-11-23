import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'

import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
  console.log('Rendering ProtectionDetails', id.toString())
  const { stopLossTriggersData$, vault$, collateralPrices$, ilkDataList$ } = useAppContext()
  // these observables could be wrapped into single one which will contain protection state as well
  // like it was for opening / managing flows
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
            // isStopLossEnabled: triggersData.isStopLossEnabled,
            // slRatio: triggersData.stopLossLevel,
            // vaultDebt: vaultData.debt,
            // currentOraclePrice: collateralPrice.currentPrice,
            // nextOraclePrice: collateralPrice.nextPrice,
            // lockedCollateral: vaultData.lockedCollateral,
            isStopLossEnabled: triggersData.isStopLossEnabled,
            slRatio: triggersData.stopLossLevel,
            vaultDebt: vaultData.debt,
            collateralizationRatio: vaultData.collateralizationRatio,
            liquidationPrice: vaultData.liquidationPrice,
            liquidationRatio: ilk.liquidationRatio,
            currentOraclePrice: collateralPrice.currentPrice,
            nextOraclePrice: collateralPrice.nextPrice,
            percentageChange: collateralPrice.percentageChange,
            isStaticPrice: collateralPrice.isStaticPrice,
            lockedCollateral: vaultData.lockedCollateral,
            token: vaultData.token,
            protectionState: {
              ilkData: ilk,
              inputAmountsEmpty: false,
              stage: 'editing',
              afterCollateralizationRatio: XYZ,
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
