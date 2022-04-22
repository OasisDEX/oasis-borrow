import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

import { Context } from '../../../../blockchain/network'
import { useAppContext } from '../../../../components/AppContextProvider'
import { RetryableLoadingButtonProps } from '../../../../components/dumb/RetryableLoadingButton'
import { GasEstimationStatus, HasGasEstimation } from '../../../../helpers/form'
import { useObservable } from '../../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../../collateralPrices/collateralPricesWithFilters'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import { extractStopLossData, prepareTriggerData } from '../common/StopLossTriggerDataExtractor'
import { REMOVE_FORM_CHANGE, RemoveFormChange } from '../common/UITypes/RemoveFormChange'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { CancelSlFormLayout, CancelSlFormLayoutProps } from './CancelSlFormLayout'

function prepareRemoveTriggerData(
  vaultData: Vault,
  triggerId: number,
  removeAllowance: boolean,
): AutomationBotRemoveTriggerData {
  const baseTriggerData = prepareTriggerData(vaultData, false, new BigNumber(0))

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
  ctx: Context
  toggleForms: () => void
  accountIsController: boolean
  collateralPrice: CollateralPricesWithFilters
  tx?: TxHelpers
}

export function CancelSlFormControl({
  vault,
  triggerData,
  ctx,
  toggleForms,
  accountIsController,
  collateralPrice,
  tx,
}: CancelSlFormControlProps) {
  const { triggerId, isStopLossEnabled } = extractStopLossData(triggerData)
  const { addGasEstimation$, uiChanges } = useAppContext()
  const [lastUIState] = useUIChanges<RemoveFormChange>(REMOVE_FORM_CHANGE)

  // TODO: if there will be no existing triggers left after removal, allowance should be set to true
  const removeAllowance = false
  const txData = useMemo(() => prepareRemoveTriggerData(vault, triggerId, removeAllowance), [
    triggerId,
  ])

  const gasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, txData),
    )
  }, [txData])

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const isOwner = ctx.status === 'connected' && ctx.account !== vault.controller

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
                ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(tokenPrice)
                : zero

            uiChanges.publish(REMOVE_FORM_CHANGE, {
              type: 'tx-details',
              txDetails: {
                txHash: (transactionState as any).txHash,
                txStatus: transactionState.status,
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

      const waitForTx = tx
        .sendWithGasEstimation(removeAutomationBotTrigger, txData)
        .subscribe(txSendSuccessHandler, sendTxErrorHandler)
    },
    isLoading: false,
    isRetry: false,
    disabled: isOwner,
    isStopLossEnabled,
  }

  const { token } = vault
  const tokenPrice = collateralPrice.data.find((x) => x.token === token)?.currentPrice!
  const etherscan = ctx.etherscan.url

  const props: CancelSlFormLayoutProps = {
    liquidationPrice: vault.liquidationPrice,
    tokenPrice,
    removeTriggerConfig: removeTriggerConfig,
    txState: lastUIState?.txDetails?.txStatus,
    txHash: lastUIState?.txDetails?.txHash,
    gasEstimation: gasEstimationData as HasGasEstimation,
    accountIsController,
    actualCancelTxCost: lastUIState?.txDetails?.totalCost,
    toggleForms,
    etherscan,
  }

  return <CancelSlFormLayout {...props} />
}
