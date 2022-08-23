import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import {
  BasicBSTriggerData,
  prepareAddBasicBSTriggerData,
  prepareRemoveBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import {
  addBasicBSTrigger,
  removeBasicBSTrigger,
} from 'features/automation/common/basicBStxHandlers'
import { maxUint256 } from 'features/automation/common/consts'
import {
  checkIfDisabledBasicBS,
  checkIfEditingBasicBS,
  getBasicBSVaultChange,
  prepareBasicBSResetData,
} from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
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
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoBuyOn: boolean
  context: Context
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
  isAutoBuyActive: boolean
}

export function AutoBuyFormControl({
  vault,
  ilkData,
  balanceInfo,
  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,
  isAutoBuyOn,
  txHelpers,
  context,
  ethMarketPrice,
  isAutoBuyActive,
  shouldRemoveAllowance,
}: AutoBuyFormControlProps) {
  const [basicBuyState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { uiChanges } = useAppContext()

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
        shouldRemoveAllowance,
      }),
    [basicBuyState.triggerId.toNumber(), shouldRemoveAllowance],
  )

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

  const isEditing = checkIfEditingBasicBS({
    basicBSTriggerData: autoBuyTriggerData,
    basicBSState: basicBuyState,
    isRemoveForm,
  })

  useEffect(() => {
    if (isEditing && isAutoBuyActive) {
      if (isAddForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'add-trigger',
          data: addTxData,
        })
      }
      if (isRemoveForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'remove-trigger',
          data: cancelTxData,
        })
      }
    }
  }, [addTxData, cancelTxData, isEditing, isAutoBuyActive])

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
    targetCollRatio: basicBuyState.targetCollRatio,
    execCollRatio: basicBuyState.execCollRatio,
    deviation: basicBuyState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  return (
    <SidebarSetupAutoBuy
      vault={vault}
      ilkData={ilkData}
      balanceInfo={balanceInfo}
      autoSellTriggerData={autoSellTriggerData}
      autoBuyTriggerData={autoBuyTriggerData}
      stopLossTriggerData={stopLossTriggerData}
      constantMultipleTriggerData={constantMultipleTriggerData}
      isAutoBuyOn={isAutoBuyOn}
      context={context}
      ethMarketPrice={ethMarketPrice}
      basicBuyState={basicBuyState}
      txHandler={txHandler}
      textButtonHandler={textButtonHandler}
      stage={stage}
      isAddForm={isAddForm}
      isRemoveForm={isRemoveForm}
      isEditing={isEditing}
      isDisabled={isDisabled}
      isFirstSetup={isFirstSetup}
      debtDelta={debtDelta}
      collateralDelta={collateralDelta}
      isAutoBuyActive={isAutoBuyActive}
    />
  )
}
