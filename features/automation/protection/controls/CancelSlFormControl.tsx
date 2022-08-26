import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import {
  prepareRemoveStopLossTriggerData,
  StopLossTriggerData,
} from 'features/automation/protection/common/stopLossTriggerData'
import {
  ADD_FORM_CHANGE,
  AddFormChange,
} from 'features/automation/protection/common/UITypes/AddFormChange'
import {
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
} from 'features/automation/protection/common/UITypes/ProtectionFormModeChange'
import { SidebarCancelStopLoss } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLoss'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useEffect, useMemo } from 'react'

import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import { REMOVE_FORM_CHANGE, RemoveFormChange } from '../common/UITypes/RemoveFormChange'
import { CancelSlFormLayoutProps } from './CancelSlFormLayout'

interface CancelSlFormControlProps {
  vault: Vault
  ilkData: IlkData
  triggerData: StopLossTriggerData
  autoSellTriggerData: BasicBSTriggerData
  ctx: Context
  toggleForms: () => void
  accountIsController: boolean
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  tx?: TxHelpers
}

export function CancelSlFormControl({
  vault,
  triggerData,
  autoSellTriggerData,
  ctx,
  toggleForms,
  accountIsController,
  priceInfo,
  balanceInfo,
  ilkData,
  tx,
  ethMarketPrice,
  shouldRemoveAllowance,
}: CancelSlFormControlProps) {
  const { triggerId, isStopLossEnabled } = triggerData
  const { uiChanges } = useAppContext()
  const [uiState] = useUIChanges<RemoveFormChange>(REMOVE_FORM_CHANGE)
  const [addSlUiState] = useUIChanges<AddFormChange>(ADD_FORM_CHANGE)
  const [currentForm] = useUIChanges<ProtectionModeChange>(PROTECTION_MODE_CHANGE_SUBJECT)

  const txData = useMemo(
    () => prepareRemoveStopLossTriggerData(vault, triggerId, shouldRemoveAllowance),
    [triggerId, shouldRemoveAllowance],
  )

  useEffect(() => {
    uiChanges.publish(TX_DATA_CHANGE, {
      type: 'remove-trigger',
      data: txData,
    })
  }, [txData, currentForm])

  const isOwner = ctx.status === 'connected' && ctx.account === vault.controller

  const removeTriggerConfig: RetryableLoadingButtonProps = {
    translationKey: 'cancel-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }
      const txSendSuccessHandler = (transactionState: TxState<AutomationBotRemoveTriggerData>) =>
        transactionStateHandler(
          (transactionState) => {
            const successTx =
              transactionState.status === TxStatus.Success ||
              transactionState.status === TxStatus.Failure

            const gasUsed = successTx
              ? new BigNumber((transactionState as any).receipt.gasUsed)
              : zero
            const effectiveGasPrice = successTx
              ? new BigNumber((transactionState as any).receipt.effectiveGasPrice)
              : zero
            const totalCost =
              !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
                ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(
                    ethMarketPrice,
                  )
                : zero

            uiChanges.publish(REMOVE_FORM_CHANGE, {
              type: 'tx-details',
              txDetails: {
                txHash: (transactionState as any).txHash,
                txStatus: transactionState.status,
                txError:
                  transactionState.status === TxStatus.Error ? transactionState.error : undefined,
                totalCost,
              },
            })
          },
          transactionState,
          finishLoader,
          waitForTx,
        )

      const sendTxErrorHandler = () => {
        finishLoader(false)
      }

      // TODO circular dependency waitForTx <-> txSendSuccessHandler
      const waitForTx = tx
        .sendWithGasEstimation(removeAutomationBotTrigger, txData)
        .subscribe(txSendSuccessHandler, sendTxErrorHandler)
    },
    isLoading: false,
    isRetry: false,
    disabled: !isOwner,
    isStopLossEnabled,
  }

  const txStatus = uiState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'editing'

  const isProgressDisabled = !!(!isOwner || isProgressStage)

  const { token } = vault
  const etherscan = ctx.etherscan.url

  const props: CancelSlFormLayoutProps = {
    liquidationPrice: vault.liquidationPrice,
    tokenPrice: priceInfo.currentCollateralPrice,
    removeTriggerConfig: removeTriggerConfig,
    txState: uiState?.txDetails?.txStatus,
    txHash: uiState?.txDetails?.txHash,
    txError: uiState?.txDetails?.txError,
    accountIsController,
    actualCancelTxCost: uiState?.txDetails?.totalCost,
    toggleForms,
    etherscan,
    ethPrice: ethMarketPrice,
    ethBalance: balanceInfo.ethBalance,
    stage,
    token,
    ilkData,
    currentCollateralRatio: vault.collateralizationRatio,
    selectedSLValue: addSlUiState.selectedSLValue,
    isProgressDisabled,
    isStopLossEnabled: triggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    vault,
  }

  return <SidebarCancelStopLoss {...props} />
}
