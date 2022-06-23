import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import { prepareAddTriggerData } from 'features/automation/protection/controls/AdjustSlFormControl'
import React, { useMemo } from 'react'
import { prepareBasicBuyTriggerCreationData } from '../common/BasicBuyTriggerExtractor'

interface OptimizationFormControlProps {
  isAutoBuyOn: boolean
  vault: Vault
  tx?: TxHelpers

}

export function OptimizationFormControl({ isAutoBuyOn, vault, tx }: OptimizationFormControlProps) {
  const mockExecCollRatio= new BigNumber(555)
  const mockTargetCollRatio= new BigNumber(247)
  const mockMaxBuyPrice= new BigNumber(24)
  const mockContinuous= true
  const mockDeviation= new BigNumber(777)  
  // TODO ŁW handle replacedTriggerId: number,
  const mockReplacedTriggerId = 0;
  // ŁW maybe it makes no sense to try call it here but use basicBuyTransactions.ts
  const txData = useMemo(
    () =>
    prepareBasicBuyTriggerCreationData(
        vault,
        mockExecCollRatio,
        mockTargetCollRatio,
        mockMaxBuyPrice,
        mockContinuous,
        mockDeviation,
        mockReplacedTriggerId,
        ),
        [        vault,
          mockExecCollRatio,
          mockTargetCollRatio,
          mockMaxBuyPrice,
          mockContinuous,
          mockDeviation,],
  )
  console.log('txData')
  console.log(txData)

  const addBasicBuyTriggerConfig: RetryableLoadingButtonProps = {
    onClick: function (finishLoader: (succed: boolean) => void): void {
      console.log('Adding BB Trigger')
      if (tx === undefined) {
        return
      }
      // TODO ŁW         .sendWithGasEstimation(addAutomationBotTrigger, txData)
      // try without circular dependency ;d
    //  tx.sendWithGasEstimation(addAutomationBotTrigger, txData).pipe(
    //   transactionToX
    //  )
     
    },
    translationKey: 'confirm',
    isRetry: false,
    isLoading: false,
    disabled: false,
    isStopLossEnabled: false
  }
  
  return <SidebarSetupAutoBuy isAutoBuyOn={isAutoBuyOn} vault={vault} addBasicBuyTriggerConfig={addBasicBuyTriggerConfig} />
}


