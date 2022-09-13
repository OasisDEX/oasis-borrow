import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { failedStatuses, maxUint256, progressStatuses } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import {
  checkIfDisabledAutoBS,
  checkIfEditingAutoBS,
  getAutoBSVaultChange,
  prepareAutoBSResetData,
} from 'features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import {
  AutoBSTriggerData,
  prepareAddAutoBSTriggerData,
} from 'features/automation/common/state/autoBSTriggerData'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/autoBuy/sidebars/SidebarSetupAutoBuy'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultType } from 'features/generalManageVault/vaultType'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

interface AutoBuyFormControlProps {
  vault: Vault
  vaultType: VaultType
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
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
  vaultType,
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
  const { uiChanges } = useAppContext()
  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)

  const isOwner = context?.status === 'connected' && context?.account === vault.controller

  const addTxData = useMemo(
    () =>
      prepareAddAutoBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicBuy,
        execCollRatio: autoBuyState.execCollRatio,
        targetCollRatio: autoBuyState.targetCollRatio,
        maxBuyOrMinSellPrice: autoBuyState.withThreshold
          ? autoBuyState.maxBuyOrMinSellPrice || maxUint256
          : maxUint256,
        continuous: autoBuyState.continuous, // leave as default
        deviation: autoBuyState.deviation,
        replacedTriggerId: autoBuyState.triggerId,
        maxBaseFeeInGwei: autoBuyState.maxBaseFeeInGwei,
      }),
    [
      autoBuyState.execCollRatio.toNumber(),
      autoBuyState.targetCollRatio.toNumber(),
      autoBuyState.maxBuyOrMinSellPrice?.toNumber(),
      autoBuyState.triggerId.toNumber(),
      autoBuyState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  const txStatus = autoBuyState?.txDetails?.txStatus
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

  const isAddForm = autoBuyState.currentForm === 'add'
  const isRemoveForm = autoBuyState.currentForm === 'remove'

  const isEditing = checkIfEditingAutoBS({
    autoBSTriggerData: autoBuyTriggerData,
    autoBSState: autoBuyState,
    isRemoveForm,
  })

  const isDisabled = checkIfDisabledAutoBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    autoBSState: autoBuyState,
    stage,
  })

  const isFirstSetup = autoBuyTriggerData.triggerId.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const { debtDelta, collateralDelta } = getAutoBSVaultChange({
    targetCollRatio: autoBuyState.targetCollRatio,
    execCollRatio: autoBuyState.execCollRatio,
    deviation: autoBuyState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
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
        autoBuyTriggerData,
        vault.collateralizationRatio,
        AUTO_BUY_FORM_CHANGE,
      )}
      publishType={AUTO_BUY_FORM_CHANGE}
      currentForm={autoBuyState.currentForm}
      triggersId={[autoBuyTriggerData.triggerId.toNumber()]}
      isActiveFlag={isAutoBuyActive}
      textButtonHandlerExtension={textButtonHandlerExtension}
    >
      {(txHandler, textButtonHandler) => (
        <SidebarSetupAutoBuy
          vault={vault}
          vaultType={vaultType}
          ilkData={ilkData}
          balanceInfo={balanceInfo}
          autoSellTriggerData={autoSellTriggerData}
          autoBuyTriggerData={autoBuyTriggerData}
          stopLossTriggerData={stopLossTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          isAutoBuyOn={isAutoBuyOn}
          context={context}
          ethMarketPrice={ethMarketPrice}
          autoBuyState={autoBuyState}
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
      )}
    </AddAndRemoveTriggerControl>
  )
}
