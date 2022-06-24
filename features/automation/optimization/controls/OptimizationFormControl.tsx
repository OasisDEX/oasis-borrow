import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import { prepareAddTriggerData } from 'features/automation/protection/controls/AdjustSlFormControl'
import { useObservable } from 'helpers/observableHook'
import { T } from 'ramda'
import React, { useMemo } from 'react'
import { prepareBasicBuyTriggerCreationData } from '../common/BasicBuyTriggerExtractor'
import { addBasicBuyTrigger } from '../transactions/basicBuyTransactions'

interface OptimizationFormControlProps {
  isAutoBuyOn: boolean
  vault: Vault
  // tx?: TxHelpers

}

export function OptimizationFormControl({ isAutoBuyOn, vault }: OptimizationFormControlProps) {
  const mockExecCollRatio= new BigNumber(555*100)
  const mockTargetCollRatio= new BigNumber(247*100)
  const mockMaxBuyPrice= new BigNumber(24)
  const mockContinuous= true
  const mockDeviation= new BigNumber(1)  
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

  const {txHelpers$} = useAppContext()
  const [txHelpers, error] = useObservable(txHelpers$)

  const addBasicBuyTriggerConfig: RetryableLoadingButtonProps = {
    onClick: function (finishLoader: (succed: boolean) => void): void {
      console.log('Adding BB Trigger')
      if (txHelpers === undefined) {
        return
      }
      // TODO ŁW         .sendWithGasEstimation(addAutomationBotTrigger, txData)
      // try without circular dependency ;d
    //  tx.sendWithGasEstimation(addAutomationBotTrigger, txData).pipe(
    //   transactionToX
    //  )
    txHelpers.sendWithGasEstimation(addAutomationBotTrigger, txData).subscribe((e) => console.log(e))
    
     
    },
    translationKey: 'confirm',
    isRetry: false,
    isLoading: false,
    disabled: false,
    isStopLossEnabled: false
  }
  
  return <SidebarSetupAutoBuy isAutoBuyOn={isAutoBuyOn} vault={vault} addBasicBuyTriggerConfig={addBasicBuyTriggerConfig} />
}


