import { TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkDataList } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import React, { useState } from 'react'

import { Context } from '../../../blockchain/network'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import {
  determineProperDefaults,
  extractSLData,
  prepareTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { CancelSlFormLayout, CancelSlFormLayoutProps } from './CancelSlFormLayout'

function prepareRemoveTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  triggerId: number,
): AutomationBotRemoveTriggerData {
  const baseTriggerData = prepareTriggerData(vaultData, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger,
    triggerId,
  }
}

interface CancelSlFormControlProps {
  vault: Vault
  ilksData: IlkDataList
  triggerData: TriggersData
  tx?: TxHelpers
  ctx: Context
}

export function CancelSlFormControl({
  vault,
  ilksData,
  triggerData,
  tx,
  ctx,
}: CancelSlFormControlProps) {
  const [collateralActive] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))

  const isOwner = ctx.status === 'connected' && ctx.account !== vault.controller
  const slTriggerData = extractSLData(triggerData)

  const currentIlkData = ilksData.filter((x) => x.ilk === vault.ilk)[0]

  const startingSlRatio = slTriggerData.isStopLossEnabled
    ? slTriggerData.stopLossLevel
    : currentIlkData.liquidationRatio
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
      const txData = prepareRemoveTriggerData(
        vault,
        collateralActive,
        selectedSLValue,
        slTriggerData.triggerId,
      )

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
  }

  return <CancelSlFormLayout {...props} />
}
