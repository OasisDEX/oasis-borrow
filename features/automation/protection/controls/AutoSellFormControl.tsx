import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { AddAndRemoveTriggerControl } from 'features/automation/common/AddAndRemoveTriggerControl'
import {
  BasicBSTriggerData,
  prepareAddBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import {
  checkIfDisabledBasicBS,
  checkIfEditingBasicBS,
  getBasicBSVaultChange,
  prepareBasicBSResetData,
} from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarSetupAutoSell } from 'features/automation/protection/controls/sidebar/SidebarSetupAutoSell'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

interface AutoSellFormControlProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
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
  const [basicSellState] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)

  const isOwner = context.status === 'connected' && context.account === vault.controller

  const addTxData = useMemo(
    () =>
      prepareAddBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicSell,
        execCollRatio: basicSellState.execCollRatio,
        targetCollRatio: basicSellState.targetCollRatio,
        maxBuyOrMinSellPrice: basicSellState.withThreshold
          ? basicSellState.maxBuyOrMinSellPrice || zero
          : zero,
        continuous: basicSellState.continuous,
        deviation: basicSellState.deviation,
        replacedTriggerId: basicSellState.triggerId,
        maxBaseFeeInGwei: basicSellState.maxBaseFeeInGwei,
      }),
    [
      basicSellState.execCollRatio.toNumber(),
      basicSellState.targetCollRatio.toNumber(),
      basicSellState.maxBuyOrMinSellPrice?.toNumber(),
      basicSellState.triggerId.toNumber(),
      basicSellState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  const isAddForm = basicSellState.currentForm === 'add'
  const isRemoveForm = basicSellState.currentForm === 'remove'

  const isEditing = checkIfEditingBasicBS({
    basicBSTriggerData: autoSellTriggerData,
    basicBSState: basicSellState,
    isRemoveForm,
  })

  const txStatus = basicSellState.txDetails?.txStatus
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

  const isDisabled = checkIfDisabledBasicBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    basicBSState: basicSellState,
    stage,
  })

  const isFirstSetup = autoSellTriggerData.triggerId.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: basicSellState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const executionPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: vault.collateralizationRatio,
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const { debtDelta, collateralDelta } = getBasicBSVaultChange({
    targetCollRatio: basicSellState.targetCollRatio,
    execCollRatio: basicSellState.execCollRatio,
    deviation: basicSellState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  const { debtDelta: debtDeltaAtCurrentCollRatio } = getBasicBSVaultChange({
    targetCollRatio: basicSellState.targetCollRatio,
    execCollRatio: vault.collateralizationRatio.times(100),
    deviation: basicSellState.deviation,
    executionPrice: executionPriceAtCurrentCollRatio,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
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
      resetData={prepareBasicBSResetData(
        autoSellTriggerData,
        vault.collateralizationRatio,
        BASIC_SELL_FORM_CHANGE,
      )}
      publishType={BASIC_SELL_FORM_CHANGE}
      currentForm={basicSellState.currentForm}
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
          basicSellState={basicSellState}
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
