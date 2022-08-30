import { TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  addConstantMultipleTrigger,
  removeConstantMultipleTrigger,
} from 'features/automation/common/constanMultipleHandlers'
import { maxUint256 } from 'features/automation/common/consts'
import { getBasicBSVaultChange } from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import {
  ConstantMultipleTriggerData,
  prepareConstantMultipleResetData,
} from 'features/automation/optimization/common/constantMultipleTriggerData'
import {
  checkIfDisabledConstantMultiple,
  checkIfEditingConstantMultiple,
} from 'features/automation/optimization/common/helpers'
import {
  prepareAddConstantMultipleTriggerData,
  prepareRemoveConstantMultipleTriggerData,
} from 'features/automation/optimization/controls/constantMultipleTriggersData'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useEffect, useMemo } from 'react'

import { SidebarSetupConstantMultiple } from '../sidebars/SidebarSetupConstantMultiple'

interface ConstantMultipleFormControlProps {
  autoBuyTriggerData: BasicBSTriggerData
  autoSellTriggerData: BasicBSTriggerData
  balanceInfo: BalanceInfo
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isConstantMultipleActive: boolean
  shouldRemoveAllowance: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
  vault: Vault
}

export function ConstantMultipleFormControl({
  autoBuyTriggerData,
  autoSellTriggerData,
  balanceInfo,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  ilkData,
  isConstantMultipleActive,
  shouldRemoveAllowance,
  stopLossTriggerData,
  txHelpers,
  vault,
}: ConstantMultipleFormControlProps) {
  const { uiChanges, gasPrice$ } = useAppContext()
  const [gasPrice] = useObservable(gasPrice$)
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const isOwner = context?.status === 'connected' && context?.account === vault.controller

  const { debt, lockedCollateral } = vault

  const addTxData = useMemo(
    () =>
      prepareAddConstantMultipleTriggerData({
        triggersId: constantMultipleTriggerData.triggersId,
        autoBuyTriggerId: autoBuyTriggerData.triggerId,
        autoSellTriggerId: autoSellTriggerData.triggerId,
        vaultData: vault,
        maxBuyPrice: constantMultipleState.buyWithThreshold
          ? constantMultipleState.maxBuyPrice || maxUint256
          : maxUint256,
        minSellPrice: constantMultipleState.sellWithThreshold
          ? constantMultipleState.minSellPrice || zero
          : zero,
        buyExecutionCollRatio: constantMultipleState.buyExecutionCollRatio,
        sellExecutionCollRatio: constantMultipleState.sellExecutionCollRatio,
        targetCollRatio: constantMultipleState.targetCollRatio, // TODO calculate using constantMultipleState.multiplier
        continuous: constantMultipleState.continuous,
        deviation: constantMultipleState.deviation,
        maxBaseFeeInGwei: constantMultipleState.maxBaseFeeInGwei,
      }),
    [
      constantMultipleTriggerData.triggersId,
      vault.collateralizationRatio.toNumber(),
      constantMultipleState.maxBuyPrice?.toNumber(),
      constantMultipleState.minSellPrice?.toNumber(),
      constantMultipleState.buyExecutionCollRatio?.toNumber(),
      constantMultipleState.sellExecutionCollRatio?.toNumber(),
      constantMultipleState.buyWithThreshold,
      constantMultipleState.sellWithThreshold,
      constantMultipleState.targetCollRatio,
      constantMultipleState.continuous,
      constantMultipleState.deviation?.toNumber(),
      constantMultipleState.maxBaseFeeInGwei?.toNumber(),
    ],
  )

  const cancelTxData = useMemo(
    () =>
      prepareRemoveConstantMultipleTriggerData({
        vaultData: vault,
        triggersId: constantMultipleTriggerData.triggersId,
        shouldRemoveAllowance,
      }),
    [constantMultipleTriggerData.triggersId, shouldRemoveAllowance],
  )

  const txStatus = constantMultipleState?.txDetails?.txStatus
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
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'reset',
          resetData: prepareConstantMultipleResetData({
            defaultMultiplier: constantMultipleState.defaultMultiplier,
            defaultCollRatio: constantMultipleState.defaultCollRatio,
            constantMultipleTriggerData,
          }),
        })
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'tx-details',
          txDetails: {},
        })
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'current-form',
          currentForm: 'add',
        })
      } else {
        if (isAddForm) {
          addConstantMultipleTrigger(txHelpers, addTxData, uiChanges, ethMarketPrice)
        }
        if (isRemoveForm) {
          removeConstantMultipleTrigger(txHelpers, cancelTxData, uiChanges, ethMarketPrice)
        }
      }
    }
  }

  function textButtonHandler() {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'current-form',
      currentForm: isAddForm ? 'remove' : 'add',
    })
    if (isAddForm) {
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'multiplier',
        multiplier: 0,
      })
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'sell-execution-coll-ratio',
        sellExecutionCollRatio: zero,
      })
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'buy-execution-coll-ratio',
        buyExecutionCollRatio: zero,
      })
    } else {
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'reset',
        resetData: prepareConstantMultipleResetData({
          defaultMultiplier: constantMultipleState.defaultMultiplier,
          defaultCollRatio: constantMultipleState.defaultCollRatio,
          constantMultipleTriggerData,
        }),
      })
    }
  }

  const isAddForm = constantMultipleState.currentForm === 'add'
  const isRemoveForm = constantMultipleState.currentForm === 'remove'

  const isEditing = checkIfEditingConstantMultiple({
    triggerData: constantMultipleTriggerData,
    state: constantMultipleState,
    isRemoveForm,
  })

  useEffect(() => {
    if (isEditing && isConstantMultipleActive) {
      if (isAddForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'add-aggregator-trigger',
          data: addTxData,
        })
      }
      if (isRemoveForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'remove-aggregator-trigger',
          data: cancelTxData,
        })
      }
    }
  }, [addTxData, cancelTxData, isEditing, isConstantMultipleActive])

  const isDisabled = checkIfDisabledConstantMultiple({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    state: constantMultipleState,
    stage,
  })
  const isFirstSetup =
    constantMultipleTriggerData.triggersId[0].isZero() &&
    constantMultipleTriggerData.triggersId[1].isZero()

  const nextBuyPrice = collateralPriceAtRatio({
    colRatio: constantMultipleState.buyExecutionCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const nextSellPrice = collateralPriceAtRatio({
    colRatio: constantMultipleState.sellExecutionCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })

  const sellPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: vault.collateralizationRatio,
    collateral: lockedCollateral,
    vaultDebt: debt,
  })

  const {
    collateralDelta: collateralToBePurchased,
    debtDelta: debtDeltaAfterBuy,
  } = getBasicBSVaultChange({
    targetCollRatio: constantMultipleState.targetCollRatio,
    execCollRatio: constantMultipleState.buyExecutionCollRatio,
    deviation: constantMultipleState.deviation,
    executionPrice: nextBuyPrice,
    lockedCollateral,
    debt,
  })
  const {
    collateralDelta: collateralToBeSold,
    debtDelta: debtDeltaAfterSell,
  } = getBasicBSVaultChange({
    targetCollRatio: constantMultipleState.targetCollRatio,
    execCollRatio: constantMultipleState.sellExecutionCollRatio,
    deviation: constantMultipleState.deviation,
    executionPrice: nextSellPrice,
    lockedCollateral,
    debt,
  })

  const { debtDelta: debtDeltaWhenSellAtCurrentCollRatio } = getBasicBSVaultChange({
    targetCollRatio: constantMultipleState.targetCollRatio,
    execCollRatio: vault.collateralizationRatio.times(100),
    deviation: constantMultipleState.deviation,
    executionPrice: sellPriceAtCurrentCollRatio,
    lockedCollateral,
    debt,
  })

  const adjustMultiplyGasEstimation = new BigNumber(1100000) // average based on historical data from blockchain
  const estimatedGasCostOnTrigger = gasPrice
    ? amountFromWei(
        adjustMultiplyGasEstimation
          .multipliedBy(gasPrice?.maxFeePerGas)
          .multipliedBy(ethMarketPrice),
      )
    : undefined
  const estimatedBuyFee = debtDeltaAfterBuy.abs().times(OAZO_FEE)
  const estimatedSellFee = debtDeltaAfterSell.abs().times(OAZO_FEE)

  return (
    <SidebarSetupConstantMultiple
      autoBuyTriggerData={autoBuyTriggerData}
      autoSellTriggerData={autoSellTriggerData}
      balanceInfo={balanceInfo}
      collateralToBePurchased={collateralToBePurchased}
      collateralToBeSold={collateralToBeSold}
      constantMultipleState={constantMultipleState}
      constantMultipleTriggerData={constantMultipleTriggerData}
      context={context}
      estimatedBuyFee={estimatedBuyFee}
      estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
      estimatedSellFee={estimatedSellFee}
      ethMarketPrice={ethMarketPrice}
      ilkData={ilkData}
      isAddForm={isAddForm}
      isConstantMultipleActive={isConstantMultipleActive}
      isDisabled={isDisabled}
      isEditing={isEditing}
      isFirstSetup={isFirstSetup}
      isRemoveForm={isRemoveForm}
      nextBuyPrice={nextBuyPrice}
      nextSellPrice={nextSellPrice}
      stage={stage}
      stopLossTriggerData={stopLossTriggerData}
      textButtonHandler={textButtonHandler}
      txHandler={txHandler}
      vault={vault}
      debtDeltaWhenSellAtCurrentCollRatio={debtDeltaWhenSellAtCurrentCollRatio}
      debtDeltaAfterSell={debtDeltaAfterSell}
    />
  )
}
