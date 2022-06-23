import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import React from 'react'
import { prepareBasicBuyTriggerCreationData } from '../common/BasicBuyTriggerExtractor'

interface OptimizationFormControlProps {
  isAutoBuyOn: boolean
  vault: Vault
  tx?: TxHelpers

}

export function OptimizationFormControl({ isAutoBuyOn, vault, tx }: OptimizationFormControlProps) {
  const addBasicBuyTriggerConfig: RetryableLoadingButtonProps = {
    onClick: function (finishLoader: (succed: boolean) => void): void {
      console.log('Adding BB Trigger')
      if (tx === undefined) {
        return
      }
    },
    translationKey: 'confirm',
    isRetry: false,
    isLoading: false,
    disabled: false,
    isStopLossEnabled: false
  }
  
  return <SidebarSetupAutoBuy isAutoBuyOn={isAutoBuyOn} vault={vault} addBasicBuyTriggerConfig={addBasicBuyTriggerConfig} />
}


