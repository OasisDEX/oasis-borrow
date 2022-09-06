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
  const [basicBuyState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

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

  const isAddForm = basicBuyState.currentForm === 'add'
  const isRemoveForm = basicBuyState.currentForm === 'remove'

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
    targetCollRatio: basicBuyState.targetCollRatio,
    execCollRatio: basicBuyState.execCollRatio,
    deviation: basicBuyState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
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
        autoBuyTriggerData,
        vault.collateralizationRatio,
        BASIC_BUY_FORM_CHANGE,
      )}
      publishType={BASIC_BUY_FORM_CHANGE}
      currentForm={basicBuyState.currentForm}
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
      )}
    </AddAndRemoveTriggerControl>
  )
}
