import BigNumber from 'bignumber.js'
import { IlkDataList } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import React, { useEffect, useState } from 'react'

import { extractSLData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'
import { AddFormChange } from '../common/UITypes/AddFormChange'
import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

function renderLayout(
  triggersData: StopLossTriggerData,
  vaultData: Vault,
  collateralPrices: CollateralPricesWithFilters,
  ilkDataList: IlkDataList,
  lastUIState: AddFormChange | undefined,
) {
  const ilk = ilkDataList.filter((x) => x.ilk === vaultData.ilk)[0]

  const collateralPrice = collateralPrices.data.filter((x) => x.token === vaultData.token)[0]

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
      inputAmountsEmpty: false,
      stage: 'editing',
      afterSlRatio: lastUIState ? lastUIState.selectedSLValue.dividedBy(100) : new BigNumber(0),
    },
  }
  return <ProtectionDetailsLayout {...props} />
}

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
  const uiSubjectName = 'AdjustSlForm'
  const {
    automationTriggersData$,
    vault$,
    collateralPrices$,
    ilkDataList$,
    uiChanges,
  } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(id)
  const automationTriggersDataWithError = useObservableWithError(autoTriggersData$)
  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)
  const ilksDataWithError = useObservableWithError(ilkDataList$)
  const [lastUIState, lastUIStateSetter] = useState<AddFormChange | undefined>(undefined)

  useEffect(() => {
    console.log('Subscribing to uiChanges')
    const uiChanges$ = uiChanges.subscribe<AddFormChange>(uiSubjectName)

    const subscription = uiChanges$.subscribe((value) => {
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler
      error={[
        automationTriggersDataWithError.error,
        vaultDataWithError.error,
        collateralPricesWithError.error,
        ilksDataWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          automationTriggersDataWithError.value,
          vaultDataWithError.value,
          collateralPricesWithError.value,
          ilksDataWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([triggersData, vaultData, collateralPrices, ilkDataList]) => {
          console.log('rendering ProtDetailsControl')
          return renderLayout(
            extractSLData(triggersData),
            vaultData,
            collateralPrices,
            ilkDataList,
            lastUIState,
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
