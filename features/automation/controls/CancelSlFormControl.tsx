import { TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import React, { useMemo, useState } from 'react'

import { Context } from '../../../blockchain/network'
import { useAppContext } from '../../../components/AppContextProvider'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { getEstimatedGasFeeText } from '../../../components/vault/VaultChangesInformation'
import { GasEstimationStatus } from '../../../helpers/form'
import { useObservable } from '../../../helpers/observableHook'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import {
  determineProperDefaults,
  extractStopLossData,
  prepareTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { CancelSlFormLayout, CancelSlFormLayoutProps } from './CancelSlFormLayout'

function prepareRemoveTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  triggerId: number,
  removeAllowance: boolean,
): AutomationBotRemoveTriggerData {
  const baseTriggerData = prepareTriggerData(vaultData, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger,
    triggerId,
    removeAllowance,
  }
}

interface CancelSlFormControlProps {
  vault: Vault
  ilkData: IlkData
  triggerData: TriggersData
  tx?: TxHelpers
  ctx: Context
}

export function CancelSlFormControl({
  vault,
  ilkData,
  triggerData,
  tx,
  ctx,
}: CancelSlFormControlProps) {
  const [collateralActive] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))
  const { triggerId, isStopLossEnabled, stopLossLevel } = extractStopLossData(triggerData)
  const { addGasEstimation$ } = useAppContext()

  // TODO: if there will be no existing triggers left after removal, allowance should be set to true
  const removeAllowance = false
  const txData = useMemo(
    () =>
      prepareRemoveTriggerData(
        vault,
        collateralActive,
        selectedSLValue,
        triggerId,
        removeAllowance,
      ),
    [collateralActive, selectedSLValue, triggerId],
  )

  const gasEstimationData$ = useMemo(
    () =>
      addGasEstimation$({ gasEstimationStatus: GasEstimationStatus.unset }, ({ estimateGas }) =>
        estimateGas(removeAutomationBotTrigger, txData),
      ),
    [txData],
  )

  const gasEstimationData = useObservable(gasEstimationData$)

  const isOwner = ctx.status === 'connected' && ctx.account !== vault.controller

  const startingSlRatio = isStopLossEnabled ? stopLossLevel : ilkData.liquidationRatio
  const [txStatus, txStatusSetter] = useState<TxState<AutomationBotRemoveTriggerData> | undefined>()

  determineProperDefaults(setSelectedSLValue, startingSlRatio)

  const removeTriggerConfig: RetryableLoadingButtonProps = {
    translationKey: 'cancel-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }
      const txSendSuccessHandler = (transactionState: TxState<AutomationBotRemoveTriggerData>) =>
        transactionStateHandler(txStatusSetter, transactionState, finishLoader, waitForTx)

      const sendTxErrorHandler = () => {
        finishLoader(false)
      }

      const waitForTx = tx
        .sendWithGasEstimation(removeAutomationBotTrigger, txData)
        .subscribe(txSendSuccessHandler, sendTxErrorHandler)
    },
    isLoading: false,
    isRetry: false,
    disabled: isOwner,
  }

  const props: CancelSlFormLayoutProps = {
    liquidationPrice: vault.liquidationPrice,
    removeTriggerConfig: removeTriggerConfig,
    txState: txStatus,
    gasEstimation: getEstimatedGasFeeText(gasEstimationData),
  }

  return <CancelSlFormLayout {...props} />
}
