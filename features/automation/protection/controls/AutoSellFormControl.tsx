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
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import {
  BasicBSTriggerData,
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
  prepareBasicBSResetData,
} from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarSetupAutoSell } from 'features/automation/protection/controls/sidebar/SidebarSetupAutoSell'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
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
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  txHelpers?: TxHelpers
}

export function AutoSellFormControl({
  vault,
  ilkData,
  balanceInfo,
  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  isAutoSellActive,
  txHelpers,
  context,
  ethMarketPrice,
}: AutoSellFormControlProps) {
  const [basicSellState] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)
  const { uiChanges, addGasEstimation$ } = useAppContext()

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

  const addTriggerGasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(addAutomationBotTrigger, addTxData),
    )
  }, [addTxData])

  const [addTriggerGasEstimationData] = useObservable(addTriggerGasEstimationData$)
  const addTriggerGasEstimation = getEstimatedGasFeeText(addTriggerGasEstimationData)
  const addTriggerGasEstimationUsd =
    addTriggerGasEstimationData &&
    (addTriggerGasEstimationData as HasGasEstimation).gasEstimationUsd

  const cancelTxData = useMemo(
    () =>
      prepareRemoveBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicSell,
        triggerId: basicSellState.triggerId,
      }),
    [basicSellState.triggerId.toNumber()],
  )

  const cancelTriggerGasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, cancelTxData),
    )
  }, [cancelTxData])

  const [cancelTriggerGasEstimationData] = useObservable(cancelTriggerGasEstimationData$)
  const cancelTriggerGasEstimation = getEstimatedGasFeeText(cancelTriggerGasEstimationData)
  const cancelTriggerGasEstimationUsd =
    cancelTriggerGasEstimationData &&
    (cancelTriggerGasEstimationData as HasGasEstimation).gasEstimationUsd

  const isAddForm = basicSellState.currentForm === 'add'
  const isRemoveForm = basicSellState.currentForm === 'remove'

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

  function txHandler() {
    if (txHelpers) {
      if (stage === 'txSuccess') {
        uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
          type: 'tx-details',
          txDetails: {},
        })
        uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
          type: 'current-form',
          currentForm: 'add',
        })
      } else {
        if (isAddForm) {
          addBasicBSTrigger(txHelpers, addTxData, uiChanges, ethMarketPrice, BASIC_SELL_FORM_CHANGE)
        }
        if (isRemoveForm) {
          removeBasicBSTrigger(
            txHelpers,
            cancelTxData,
            uiChanges,
            ethMarketPrice,
            BASIC_SELL_FORM_CHANGE,
          )
        }
      }
    }
  }

  function textButtonHandler() {
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'current-form',
      currentForm: isAddForm ? 'remove' : 'add',
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'reset',
      resetData: prepareBasicBSResetData(autoSellTriggerData),
    })
  }

  const gasEstimationUsd = isAddForm ? addTriggerGasEstimationUsd : cancelTriggerGasEstimationUsd

  const isEditing = checkIfEditingBasicBS({
    basicBSTriggerData: autoSellTriggerData,
    basicBSState: basicSellState,
    isRemoveForm,
  })

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

  const { debtDelta, collateralDelta } =
    basicSellState.targetCollRatio.gt(zero) && basicSellState.execCollRatio.gt(zero)
      ? getVaultChange({
          currentCollateralPrice: executionPrice,
          marketPrice: executionPrice,
          slippage: basicSellState.deviation.div(100),
          debt: vault.debt,
          lockedCollateral: vault.lockedCollateral,
          requiredCollRatio: basicSellState.targetCollRatio.div(100),
          depositAmount: zero,
          paybackAmount: zero,
          generateAmount: zero,
          withdrawAmount: zero,
          OF: OAZO_FEE,
          FF: LOAN_FEE,
        })
      : { debtDelta: zero, collateralDelta: zero }

  return (
    <SidebarSetupAutoSell
      vault={vault}
      ilkData={ilkData}
      balanceInfo={balanceInfo}
      autoSellTriggerData={autoSellTriggerData}
      autoBuyTriggerData={autoBuyTriggerData}
      stopLossTriggerData={stopLossTriggerData}
      isAutoSellActive={isAutoSellActive}
      context={context}
      ethMarketPrice={ethMarketPrice}
      basicSellState={basicSellState}
      txHandler={txHandler}
      textButtonHandler={textButtonHandler}
      stage={stage}
      gasEstimationUsd={gasEstimationUsd}
      addTriggerGasEstimation={addTriggerGasEstimation}
      cancelTriggerGasEstimation={cancelTriggerGasEstimation}
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
