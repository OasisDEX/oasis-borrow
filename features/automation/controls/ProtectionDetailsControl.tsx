import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { useEffect, useState } from 'react'

import { AddFormChange } from '../common/UITypes/AddFormChange'
import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'
import { StopLossTriggerData } from '../triggers/StopLossTriggerData'
import { Vault } from 'blockchain/vaults'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { IlkDataList } from 'blockchain/ilks'

function renderLayout(triggersData : StopLossTriggerData, vaultData : Vault, 
  collateralPrices : CollateralPricesWithFilters, ilkDataList : IlkDataList,
  lastUIState: AddFormChange | undefined){

  const ilk = ilkDataList.filter((x) => x.ilk === vaultData.ilk)[0]

  const collateralPrice = collateralPrices.data.filter(
    (x) => x.token === vaultData.token,
  )[0]

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
      afterSlRatio: lastUIState
        ? lastUIState.selectedSLValue.dividedBy(100)
        : new BigNumber(0),
    },
  }
  return <ProtectionDetailsLayout {...props} />
}

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
  const uiSubjectName = 'AdjustSlForm'
  const subscriberId = 'ProtectionDetailsControl'
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

  useEffect(()=>{
    console.log("Subscribing to uiChanges")
    uiChanges.subscribe<AddFormChange>(uiSubjectName, subscriberId, (value) => {
      console.log('New UI value received', value)
      lastUIStateSetter(value)
    });
    return ()=>{
      console.log("Unsubscribing FROM uiChanges")
      return uiChanges.unsubscribe(uiSubjectName, subscriberId);
    }
  },[]);

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
          return renderLayout(triggersData, vaultData, collateralPrices, ilkDataList, lastUIState);
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
