import { TxStatus } from '@oasisdex/transactions'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { addConstantMultipleTrigger } from 'features/automation/common/constanMultipleHandlers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useMemo } from 'react'

import { SidebarSetupConstantMultiple } from '../sidebars/SidebarSetupConstantMultiple'
import {prepareAddConstantMultipleTriggerData } from 'features/automation/optimization/controls/constantMultipleTriggersData'
import BigNumber from 'bignumber.js'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { zero } from 'helpers/zero'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { IlkData } from 'blockchain/ilks'
import { calculateCollRatioForMultiply } from 'features/automation/common/helpers'
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

}

export function ConstantMultipleFormControl({
  context,
  isConstantMultipleActive,
  txHelpers,
  vault,
  ethMarketPrice,
  ilkData,

  stopLossTriggerData,
autoSellTriggerData,
autoBuyTriggerData,
}: ConstantMultipleFormControlProps) {
  const { uiChanges /*, addGasEstimation$*/ } = useAppContext()
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
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

  const isAddForm = true
  // const isAddForm = constantMultipleState.currentForm === 'add'
  const isRemoveForm = constantMultipleState.currentForm === 'remove'

  const addTxData = useMemo(
    () => 
    prepareAddConstantMultipleTriggerData({
      groupId: constantMultipleState.triggerId, // TODO ŁW - consider changing triggerId to groupId
      vaultData: vault,
      maxBuyPrice: constantMultipleState.buyWithThreshold ? constantMultipleState.maxBuyPrice || maxUint256 : maxUint256,
      minSellPrice: constantMultipleState.sellWithThreshold ? constantMultipleState.minSellPrice  || zero : zero,
      buyExecutionCollRatio: constantMultipleState.buyExecutionCollRatio,
      sellExecutionCollRatio:  constantMultipleState.sellExecutionCollRatio,
      buyWithThreshold: constantMultipleState.buyWithThreshold,
      sellWithThreshold: constantMultipleState. sellWithThreshold,
      targetCollRatio: constantMultipleState.targetCollRatio, // TODO calculate using constantMultipleState.multiplier
      continuous: constantMultipleState.continuous,
      deviation: constantMultipleState. deviation,
      maxBaseFeeInGwei: constantMultipleState.maxBaseFeeInGwei,
    }), [
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
    ]
  )

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
          // addBasicBSTrigger(txHelpers, addTxData, uiChanges, ethMarketPrice, BASIC_BUY_FORM_CHANGE)
        }
        if (isRemoveForm) {
          // TODO ŁW can't remove as can't load from cache
        }
      }
    }
  }

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
          targetCollRatio: targetCollRatioForSelectedMultiplier
        })    
      }}
      txHandler={txHandler}
      ilkData={ilkData}
      autoBuyTriggerData={autoBuyTriggerData}
      stopLossTriggerData={stopLossTriggerData}
      vault={vault}
    />
  )
}
