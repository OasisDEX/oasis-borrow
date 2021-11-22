import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'

export function ProtectionDetails({ id }: { id: BigNumber }) {
  console.log('Rendering ProtectionDetails', id.toString())
  const { stopLossTriggersData$ } = useAppContext()
  const slTriggerData$ = stopLossTriggersData$(id)
  const slTriggerDataWithError = useObservableWithError(slTriggerData$)
  return (
    <WithLoadingIndicator
      value={[slTriggerDataWithError.value]}
      customLoader={<VaultContainerSpinner />}
    >
      {([triggersData]) => {
        console.log('Rendering ProtectionDetails Internal', triggersData)
        return (
          <h1>
            TODO Protection Level = {triggersData.stopLossLevel.toString()}, CloseToCollateral ={' '}
            {triggersData.isToCollateral.toString()}, Enabled ={' '}
            {triggersData.isStopLossEnabled.toString()}
          </h1>
        )
      }}
    </WithLoadingIndicator>
  )
}
