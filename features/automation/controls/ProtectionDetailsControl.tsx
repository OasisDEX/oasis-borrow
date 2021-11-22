import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'

import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

export function ProtectionDetailsControl({ id }: { id: BigNumber }) {
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
        const props: ProtectionDetailsLayoutProps = {
          isStopLossEnabled: triggersData.isStopLossEnabled,
          isToCollateral: triggersData.isToCollateral,
          stopLossLevel: triggersData.stopLossLevel,
        }
        return <ProtectionDetailsLayout {...props} />
      }}
    </WithLoadingIndicator>
  )
}
