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
import { zero } from 'helpers/zero'
import React, { useEffect, useMemo, useState } from 'react'

import { Context } from '../../../blockchain/network'
import { useAppContext } from '../../../components/AppContextProvider'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { getEstimatedGasFeeText } from '../../../components/vault/VaultChangesInformation'
import { GasEstimationStatus } from '../../../helpers/form'
import { useObservable } from '../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../collateralPrices/collateralPricesWithFilters'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import {
  extractStopLossData,
  prepareTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { RemoveFormChange, removeFormReducer, REMOVE_FORM_CHANGE } from '../common/UITypes/RemoveFormChange'
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
  ctx: Context
  toggleForms: () => void
  accountIsController: boolean
  collateralPrice: CollateralPricesWithFilters
  tx?: TxHelpers
}

export function CancelSlFormControl({
  vault,
  ilkData,
  triggerData,
  ctx,
  toggleForms,
  accountIsController,
  collateralPrice,
  tx,
}: CancelSlFormControlProps) {
  const [collateralActive] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))
  const { triggerId, isStopLossEnabled, stopLossLevel } = extractStopLossData(triggerData)
  const { addGasEstimation$, uiChanges } = useAppContext()
  const initial = uiChanges.lastPayload<RemoveFormChange>(REMOVE_FORM_CHANGE);
  const [lastUIState, lastUIStateSetter] = useState<RemoveFormChange | undefined>(initial)
  
  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<RemoveFormChange>(REMOVE_FORM_CHANGE)

    const subscription = uiChanges$.subscribe((value) => {
      console.log("New RemoveForm change", value)
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

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

  const gasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, txData),
    )
  }, [txData])

  const gasEstimationData = useObservable(gasEstimationData$)
  const gasEstimation = getEstimatedGasFeeText(gasEstimationData)

  const isOwner = ctx.status === 'connected' && ctx.account !== vault.controller

  const startingSlRatio = isStopLossEnabled ? stopLossLevel : ilkData.liquidationRatio

  const removeTriggerConfig: RetryableLoadingButtonProps = {
    translationKey: 'cancel-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }
      const txSendSuccessHandler = (transactionState: TxState<AutomationBotRemoveTriggerData>) =>
        transactionStateHandler((transactionState)=>{

          const successTx = transactionState.status === TxStatus.Success || transactionState.status === TxStatus.Failure;
          
          const gasUsed = successTx ? new BigNumber((transactionState as any).receipt.gasUsed) : zero
          const effectiveGasPrice = successTx ? new BigNumber((transactionState as any).receipt.effectiveGasPrice) : zero
          const totalCost =
            !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
              ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(tokenPrice)
              : zero
              
          uiChanges.publish(
            REMOVE_FORM_CHANGE,
            removeFormReducer(lastUIState || ({} as RemoveFormChange), {
              type: 'tx-details',
              txDetails: {
                txHash: (transactionState as any).txHash,
                txStatus: transactionState.status,
                totalCost
              },
            }),
          )
        }, transactionState, finishLoader, waitForTx)
        
      

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
    gasEstimation: gasEstimation,
    accountIsController,
    toggleForms,
    etherscan,
  }

  return <CancelSlFormLayout {...props} />
}
