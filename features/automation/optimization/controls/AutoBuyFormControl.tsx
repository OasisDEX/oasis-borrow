import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger, removeAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import {
  BasicBSTriggerData,
  maxUint256,
  prepareAddBasicBSTriggerData,
  prepareRemoveBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import {
  addBasicBSTrigger,
  removeBasicBSTrigger,
} from 'features/automation/common/basicBStxHandlers'
import {
  checkIfDisabledBasicBS,
  checkIfEditingBasicBS,
  getBasicBSVaultChange,
  prepareBasicBSResetData,
} from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect, useMemo } from 'react'

interface AutoBuyFormControlProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  isAutoBuyOn: boolean
  context: Context
  ethMarketPrice: BigNumber
  txHelpers?: TxHelpers
}

export function AutoBuyFormControl({
  vault,
  ilkData,
  balanceInfo,
  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  isAutoBuyOn,
  txHelpers,
  context,
  ethMarketPrice,
}: AutoBuyFormControlProps) {
  const [basicBuyState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { uiChanges } = useAppContext()

  const gasEstimationContext = useGasEstimationContext()
  const gasEstimationText = getEstimatedGasFeeText(gasEstimationContext)

  const isOwner = context?.status === 'connected' && context?.account === vault.controller

  const addTxData = useMemo(
    () =>
      prepareAddBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicBuy,
        execCollRatio: basicBuyState.execCollRatio,
        targetCollRatio: basicBuyState.targetCollRatio,
        maxBuyOrMinSellPrice: basicBuyState.withThreshold
          ? basicBuyState.maxBuyOrMinSellPrice || maxUint256
          : maxUint256,
        continuous: basicBuyState.continuous, // leave as default
        deviation: basicBuyState.deviation,
        replacedTriggerId: basicBuyState.triggerId,
        maxBaseFeeInGwei: basicBuyState.maxBaseFeeInGwei,
      }),
    [
      basicBuyState.execCollRatio.toNumber(),
      basicBuyState.targetCollRatio.toNumber(),
      basicBuyState.maxBuyOrMinSellPrice?.toNumber(),
      basicBuyState.triggerId.toNumber(),
      basicBuyState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  const cancelTxData = useMemo(
    () =>
      prepareRemoveBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicBuy,
        triggerId: basicBuyState.triggerId,
      }),
    [basicBuyState.triggerId.toNumber()],
  )

  const cancelTriggerGasEstimationUsd = gasEstimationContext.usdValue

  const txStatus = basicBuyState?.txDetails?.txStatus
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

  function txHandler() {
    if (txHelpers) {
      if (stage === 'txSuccess') {
        uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
          type: 'tx-details',
          txDetails: {},
        })
        uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
          type: 'current-form',
          currentForm: 'add',
        })
      } else {
        if (isAddForm) {
          addBasicBSTrigger(txHelpers, addTxData, uiChanges, ethMarketPrice, BASIC_BUY_FORM_CHANGE)
        }
        if (isRemoveForm) {
          removeBasicBSTrigger(
            txHelpers,
            cancelTxData,
            uiChanges,
            ethMarketPrice,
            BASIC_BUY_FORM_CHANGE,
          )
        }
      }
    }
  }

  function textButtonHandler() {
    uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
      type: 'current-form',
      currentForm: isAddForm ? 'remove' : 'add',
    })
    uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
      type: 'reset',
      resetData: prepareBasicBSResetData(autoBuyTriggerData),
    })
  }

  const isAddForm = basicBuyState.currentForm === 'add'
  const isRemoveForm = basicBuyState.currentForm === 'remove'

  useEffect(() => {
    if (isAddForm) {
      uiChanges.publish(TX_DATA_CHANGE, {
        type: 'add-trigger',
        tx: {
          data: addTxData,
          transaction: addAutomationBotTrigger,
        },
      })
    }

    if (isRemoveForm) {
      uiChanges.publish(TX_DATA_CHANGE, {
        type: 'remove-trigger',
        tx: {
          data: cancelTxData,
          transaction: removeAutomationBotTrigger,
        },
      })
    }
  }, [addTxData, cancelTxData])

  const isEditing = checkIfEditingBasicBS({
    basicBSTriggerData: autoBuyTriggerData,
    basicBSState: basicBuyState,
    isRemoveForm,
  })

  const isDisabled = checkIfDisabledBasicBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    basicBSState: basicBuyState,
    stage,
  })

  const isFirstSetup = autoBuyTriggerData.triggerId.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: basicBuyState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const { debtDelta, collateralDelta } = getBasicBSVaultChange({
    basicBSState: basicBuyState,
    vault,
    executionPrice,
  })

  return (
    <SidebarSetupAutoBuy
      vault={vault}
      ilkData={ilkData}
      balanceInfo={balanceInfo}
      autoSellTriggerData={autoSellTriggerData}
      autoBuyTriggerData={autoBuyTriggerData}
      stopLossTriggerData={stopLossTriggerData}
      isAutoBuyOn={isAutoBuyOn}
      context={context}
      ethMarketPrice={ethMarketPrice}
      basicBuyState={basicBuyState}
      txHandler={txHandler}
      textButtonHandler={textButtonHandler}
      stage={stage}
      addTriggerGasEstimation={gasEstimationText}
      cancelTriggerGasEstimation={gasEstimationText}
      isAddForm={isAddForm}
      isRemoveForm={isRemoveForm}
      isEditing={isEditing}
      isDisabled={isDisabled}
      isFirstSetup={isFirstSetup}
      debtDelta={debtDelta}
      collateralDelta={collateralDelta}
    />
  )
}
