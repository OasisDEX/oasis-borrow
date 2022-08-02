import { TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { addConstantMultipleTrigger } from 'features/automation/common/constanMultipleHandlers'
import {
  calculateCollRatioForMultiply,
  getBasicBSVaultChange,
} from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import { prepareAddConstantMultipleTriggerData } from 'features/automation/optimization/controls/constantMultipleTriggersData'
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
  context: Context
  isConstantMultipleActive: boolean
  txHelpers?: TxHelpers
  vault: Vault
  ethMarketPrice: BigNumber
  ilkData: IlkData
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  balanceInfo: BalanceInfo
}

export function ConstantMultipleFormControl({
  // TODO ŁW commented out values will probably be used in next stories
  // context,
  isConstantMultipleActive,
  txHelpers,
  vault,
  ethMarketPrice,
  ilkData,
  stopLossTriggerData,
  autoSellTriggerData,
  autoBuyTriggerData,
  balanceInfo,
}: ConstantMultipleFormControlProps) {
  const { uiChanges, gasPrice$ } = useAppContext()
  const [gasPrice] = useObservable(gasPrice$)
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const { debt, lockedCollateral } = vault

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

  const isAddForm = true // TODO ŁW , handle when implementing middle stages
  // const isAddForm = constantMultipleState.currentForm === 'add'
  const isRemoveForm = constantMultipleState.currentForm === 'remove'

  const addTxData = useMemo(
    () =>
      prepareAddConstantMultipleTriggerData({
        groupId: constantMultipleState.triggerId, // TODO ŁW - consider changing triggerId to groupId
        vaultData: vault,
        maxBuyPrice: constantMultipleState.buyWithThreshold
          ? constantMultipleState.maxBuyPrice || maxUint256
          : maxUint256,
        minSellPrice: constantMultipleState.sellWithThreshold
          ? constantMultipleState.minSellPrice || zero
          : zero,
        buyExecutionCollRatio: constantMultipleState.buyExecutionCollRatio,
        sellExecutionCollRatio: constantMultipleState.sellExecutionCollRatio,
        buyWithThreshold: constantMultipleState.buyWithThreshold,
        sellWithThreshold: constantMultipleState.sellWithThreshold,
        targetCollRatio: constantMultipleState.targetCollRatio, // TODO calculate using constantMultipleState.multiplier
        continuous: constantMultipleState.continuous,
        deviation: constantMultipleState.deviation,
        maxBaseFeeInGwei: constantMultipleState.maxBaseFeeInGwei,
      }),
    [
      1, //triggerid
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

  useEffect(() => {
    if (isEditing && isConstantMultipleActive) {
      if (isAddForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'add-aggregator-trigger',
          data: addTxData,
        })
      }
      // TODO uncomment when remove form will be ready
      // if (isRemoveForm) {
      //   uiChanges.publish(TX_DATA_CHANGE, {
      //     type: 'remove-aggregator-trigger',
      //     data: cancelTxData,
      //   })
      // }
    }
  }, [addTxData /* cancelTxData, isEditing */, isConstantMultipleActive])

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

  function txHandler() {
    if (txHelpers) {
      if (stage === 'txSuccess') {
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
          // TODO ŁW can't remove for now as can't load from cache
        }
      }
    }
  }

  // TODO: get this value based on something similar to checkIfEditingBasicBS
  const isEditing = true

  return (
    <SidebarSetupConstantMultiple
      vault={vault}
      stage={'editing'}
      constantMultipleState={constantMultipleState}
      isAddForm={true}
      isRemoveForm={false}
      isDisabled={false}
      isFirstSetup={true}
      onChange={(multiplier) => {
        const targetCollRatioForSelectedMultiplier = calculateCollRatioForMultiply(multiplier)
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'multiplier',
          multiplier: multiplier,
          targetCollRatio: targetCollRatioForSelectedMultiplier,
        })
      }}
      txHandler={txHandler}
      ilkData={ilkData}
      autoBuyTriggerData={autoBuyTriggerData}
      autoSellTriggerData={autoSellTriggerData}
      stopLossTriggerData={stopLossTriggerData}
      ethMarketPrice={ethMarketPrice}
      balanceInfo={balanceInfo}
      isEditing={isEditing}
      nextBuyPrice={nextBuyPrice}
      nextSellPrice={nextSellPrice}
      collateralToBePurchased={collateralToBePurchased}
      collateralToBeSold={collateralToBeSold}
      estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
      estimatedBuyFee={estimatedBuyFee}
      estimatedSellFee={estimatedSellFee}
    />
  )
}
