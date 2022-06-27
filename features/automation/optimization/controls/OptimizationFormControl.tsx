import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import { useObservable } from 'helpers/observableHook'
import React, { useMemo } from 'react'

import { prepareBasicBuyTriggerCreationData } from '../common/BasicBuyTriggerExtractor'

interface OptimizationFormControlProps {
  isAutoBuyOn: boolean
  vault: Vault
  // tx?: TxHelpers
}

export function OptimizationFormControl({ isAutoBuyOn, vault }: OptimizationFormControlProps) {
  // TODO ŁW this are hardcoded mock values
  const mockExecCollRatio = new BigNumber(555 * 100)
  const mockTargetCollRatio = new BigNumber(247 * 100)
  const mockMaxBuyPrice = new BigNumber(24)
  const mockContinuous = true
  const mockDeviation = new BigNumber(1)
  // TODO ŁW handle replacedTriggerId: number,
  const mockReplacedTriggerId = 0
  // final solution will use basicBuyTransactions.ts - addBasicBuyTrigger
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
    [vault, mockExecCollRatio, mockTargetCollRatio, mockMaxBuyPrice, mockContinuous, mockDeviation],
  )

  const { txHelpers$ } = useAppContext()
  const [txHelpers /*, error*/] = useObservable(txHelpers$)

  const addBasicBuyTriggerConfig: RetryableLoadingButtonProps = {
    onClick: function (_finishLoader: (succed: boolean) => void): void {
      console.log('Adding BB Trigger')
      if (txHelpers === undefined) {
        return
      }
      // TODO handle all AddBasicBuyChange
      txHelpers
        .sendWithGasEstimation(addAutomationBotTrigger, txData)
        .subscribe((e) => console.log(e))
    },
    translationKey: 'confirm',
    isRetry: false,
    isLoading: false,
    disabled: false,
    isStopLossEnabled: false,
  }

  return (
    <SidebarSetupAutoBuy
      isAutoBuyOn={isAutoBuyOn}
      vault={vault}
      addBasicBuyTriggerConfig={addBasicBuyTriggerConfig}
    />
  )
}
