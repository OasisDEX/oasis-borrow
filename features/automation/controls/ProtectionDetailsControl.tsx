import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { useState } from 'hoist-non-react-statics/node_modules/@types/react'
import React from 'react'

import { AddFormChange } from '../common/UITypes/AddFormChange'
import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
  const uiSubjectName = 'AdjustSlForm'
  const {
    stopLossTriggersData$,
    vault$,
    collateralPrices$,
    ilkDataList$,
    uiChanges,
  } = useAppContext()
  const slTriggerData$ = stopLossTriggersData$(id)
  const slTriggerDataWithError = useObservableWithError(slTriggerData$)
  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)
  const ilksDataWithError = useObservableWithError(ilkDataList$)
  const [lastUIState, lastUIStateSetter] = useState<AddFormChange | undefined>(undefined)

  uiChanges.subscribe<AddFormChange>(uiSubjectName, (value) => {
    console.log('New UI value received', value)
    lastUIStateSetter(value)
  })

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

          /*TO DO: this is duplicated and can be extracted*/
          const currentCollRatio = vaultData.lockedCollateral
            .multipliedBy(collateralPrice.currentPrice)
            .dividedBy(vaultData.debt)

          const computedAfterLiqPrice = lastUIState?.selectedSLValue
            .dividedBy(100)
            .multipliedBy(collateralPrice.currentPrice)
            .dividedBy(currentCollRatio)
          /* END OF DUPLICATION */

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
              afterSlRatio: lastUIState ? lastUIState.selectedSLValue : new BigNumber(0),
              afterSlTriggeringPrice: computedAfterLiqPrice,
            },
          }
          return <ProtectionDetailsLayout {...props} />
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
