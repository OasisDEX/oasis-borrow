import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import {
  checkIfDisabledAutoBS,
  checkIfEditingAutoBS,
  getAutoBSVaultChange,
  prepareAutoBSResetData,
} from 'features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import {
  AutoBSTriggerData,
  prepareAddAutoBSTriggerData,
} from 'features/automation/common/state/autoBSTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { SidebarSetupAutoSell } from 'features/automation/protection/autoSell/sidebars/SidebarSetupAutoSell'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

interface AutoSellFormControlProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

export function AutoSellFormControl({
  vault,
  ilkData,
  balanceInfo,
  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,
  isAutoSellActive,
  txHelpers,
  context,
  ethMarketPrice,
  shouldRemoveAllowance,
}: AutoSellFormControlProps) {
  const { uiChanges } = useAppContext()
  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const isOwner = context.status === 'connected' && context.account === vault.controller

  const addTxData = useMemo(
    () =>
      prepareAddAutoBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicSell,
        execCollRatio: autoSellState.execCollRatio,
        targetCollRatio: autoSellState.targetCollRatio,
        maxBuyOrMinSellPrice: autoSellState.withThreshold
          ? autoSellState.maxBuyOrMinSellPrice || zero
          : zero,
        continuous: autoSellState.continuous,
        deviation: autoSellState.deviation,
        replacedTriggerId: autoSellState.triggerId,
        maxBaseFeeInGwei: autoSellState.maxBaseFeeInGwei,
      }),
    [
      autoSellState.execCollRatio.toNumber(),
      autoSellState.targetCollRatio.toNumber(),
      autoSellState.maxBuyOrMinSellPrice?.toNumber(),
      autoSellState.triggerId.toNumber(),
      autoSellState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  const isAddForm = autoSellState.currentForm === 'add'
  const isRemoveForm = autoSellState.currentForm === 'remove'

  const isEditing = checkIfEditingAutoBS({
    autoBSTriggerData: autoSellTriggerData,
    autoBSState: autoSellState,
    isRemoveForm,
  })

  const txStatus = autoSellState.txDetails?.txStatus
  const isSuccessStage = txStatus === TxStatus.Success
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'editing'

  const isDisabled = checkIfDisabledAutoBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    autoBSState: autoSellState,
    stage,
  })

  const isFirstSetup = autoSellTriggerData.triggerId.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoSellState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const executionPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: vault.collateralizationRatio,
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const { debtDelta, collateralDelta } = getAutoBSVaultChange({
    targetCollRatio: autoSellState.targetCollRatio,
    execCollRatio: autoSellState.execCollRatio,
    deviation: autoSellState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  const { debtDelta: debtDeltaAtCurrentCollRatio } = getAutoBSVaultChange({
    targetCollRatio: autoSellState.targetCollRatio,
    execCollRatio: vault.collateralizationRatio.times(100),
    deviation: autoSellState.deviation,
    executionPrice: executionPriceAtCurrentCollRatio,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
        type: 'target-coll-ratio',
        targetCollRatio: zero,
      })
    }
  }

  return (
    <AddAndRemoveTriggerControl
      txHelpers={txHelpers!}
      ethMarketPrice={ethMarketPrice}
      isEditing={isEditing}
      removeAllowance={shouldRemoveAllowance}
      proxyAddress={vault.owner}
      stage={stage}
      addTxData={addTxData}
      resetData={prepareAutoBSResetData(
        autoSellTriggerData,
        vault.collateralizationRatio,
        AUTO_SELL_FORM_CHANGE,
      )}
      publishType={AUTO_SELL_FORM_CHANGE}
      currentForm={autoSellState.currentForm}
      triggersId={[autoSellTriggerData.triggerId.toNumber()]}
      isActiveFlag={isAutoSellActive}
      textButtonHandlerExtension={textButtonHandlerExtension}
    >
      {(txHandler, textButtonHandler) => (
        <SidebarSetupAutoSell
          vault={vault}
          ilkData={ilkData}
          balanceInfo={balanceInfo}
          autoSellTriggerData={autoSellTriggerData}
          autoBuyTriggerData={autoBuyTriggerData}
          stopLossTriggerData={stopLossTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          isAutoSellActive={isAutoSellActive}
          context={context}
          ethMarketPrice={ethMarketPrice}
          autoSellState={autoSellState}
          textButtonHandler={textButtonHandler}
          stage={stage}
          isAddForm={isAddForm}
          isRemoveForm={isRemoveForm}
          isEditing={isEditing}
          isDisabled={isDisabled}
          isFirstSetup={isFirstSetup}
          debtDelta={debtDelta}
          debtDeltaAtCurrentCollRatio={debtDeltaAtCurrentCollRatio}
          collateralDelta={collateralDelta}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
