import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import {
  closeVaultOptions,
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  failedStatuses,
  MAX_DEBT_FOR_SETTING_STOP_LOSS,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
  progressStatuses,
} from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  getIsEditingStopLoss,
  getSliderPercentageFill,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import { SidebarSetupStopLoss } from 'features/automation/protection/stopLoss/sidebars/SidebarSetupStopLoss'
import { stopLossSliderBasicConfig } from 'features/automation/protection/stopLoss/sliderConfig'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  prepareAddStopLossTriggerData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

interface StopLossFormControlProps {
  vault: Vault
  priceInfo: PriceInfo
  ilkData: IlkData
  stopLossTriggerData: StopLossTriggerData
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  isStopLossActive: boolean
  txHelpers?: TxHelpers
}

export function StopLossFormControl({
  vault,
  priceInfo: { nextCollateralPrice },
  ilkData,
  stopLossTriggerData,
  autoSellTriggerData,
  autoBuyTriggerData,
  constantMultipleTriggerData,
  context,
  txHelpers,
  ethMarketPrice,
  balanceInfo,
  shouldRemoveAllowance,
  isStopLossActive,
}: StopLossFormControlProps) {
  const { triggerId, stopLossLevel, isStopLossEnabled, isToCollateral } = stopLossTriggerData

  const isOwner = context.status === 'connected' && context.account === vault.controller
  const { uiChanges } = useAppContext()

  const token = vault.token
  const tokenData = getToken(token)

  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  const replacedTriggerId = triggerId.toNumber()

  const addTxData = useMemo(
    () =>
      prepareAddStopLossTriggerData(
        vault,
        stopLossState.collateralActive,
        stopLossState.stopLossLevel,
        replacedTriggerId,
      ),
    [stopLossState.collateralActive, stopLossState.stopLossLevel, replacedTriggerId],
  )

  const isAddForm = stopLossState.currentForm === 'add'
  const isRemoveForm = stopLossState.currentForm === 'remove'

  const isEditing = getIsEditingStopLoss({
    isStopLossEnabled,
    selectedSLValue: stopLossState.stopLossLevel,
    stopLossLevel,
    collateralActive: stopLossState.collateralActive,
    isToCollateral,
    isRemoveForm,
  })

  const liqRatio = ilkData.liquidationRatio

  const closePickerConfig: PickCloseStateProps = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
    },
    isCollateralActive: stopLossState.collateralActive,
    collateralTokenSymbol: token,
    collateralTokenIconCircle: tokenData.iconCircle,
  }

  const max = autoSellTriggerData.isTriggerEnabled
    ? autoSellTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).div(100)
    : constantMultipleTriggerData.isTriggerEnabled
    ? constantMultipleTriggerData.sellExecutionCollRatio
        .minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET)
        .div(100)
    : vault.collateralizationRatioAtNextPrice.minus(NEXT_COLL_RATIO_OFFSET.div(100))

  const sliderPercentageFill = getSliderPercentageFill({
    value: stopLossState.stopLossLevel,
    min: ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)),
    max,
  })

  const maxBoundry = new BigNumber(max.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN))

  const afterNewLiquidationPrice = stopLossState.stopLossLevel
    .dividedBy(100)
    .multipliedBy(nextCollateralPrice)
    .dividedBy(vault.collateralizationRatioAtNextPrice)

  const sliderConfig: SliderValuePickerProps = {
    ...stopLossSliderBasicConfig,
    sliderPercentageFill,
    leftBoundry: stopLossState.stopLossLevel,
    rightBoundry: afterNewLiquidationPrice,
    lastValue: stopLossState.stopLossLevel,
    maxBoundry,
    minBoundry: liqRatio.multipliedBy(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    onChange: (slCollRatio) => {
      if (stopLossState.collateralActive === undefined) {
        uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }

      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'stop-loss-level',
        stopLossLevel: slCollRatio,
      })
    },
  }

  const txStatus = stopLossState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const maxDebtForSettingStopLoss = vault.debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'stopLossEditing'

  const isDisabled =
    (isProgressStage || !isOwner || !isEditing || (isAddForm && maxDebtForSettingStopLoss)) &&
    stage !== 'txSuccess'

  const sliderMin = ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  const selectedStopLossCollRatioIfTriggerDoesntExist = sliderMin.plus(
    DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  )
  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel,
    isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  const resetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: isToCollateral,
    txDetails: {},
  }

  const executionPrice = collateralPriceAtRatio({
    colRatio: stopLossState.stopLossLevel.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const isFirstSetup = stopLossTriggerData.triggerId.isZero()

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'stop-loss-level',
        stopLossLevel: zero,
      })
    }
  }

  return (
    <AddAndRemoveTriggerControl
      txHelpers={txHelpers}
      ethMarketPrice={ethMarketPrice}
      isEditing={isEditing}
      removeAllowance={shouldRemoveAllowance}
      proxyAddress={vault.owner}
      stage={stage}
      addTxData={addTxData}
      resetData={resetData}
      publishType={STOP_LOSS_FORM_CHANGE}
      currentForm={stopLossState.currentForm}
      triggersId={[triggerId.toNumber()]}
      isActiveFlag={isStopLossActive}
      textButtonHandlerExtension={textButtonHandlerExtension}
    >
      {(txHandler, textButtonHandler) => (
        <SidebarSetupStopLoss
          vault={vault}
          ilkData={ilkData}
          balanceInfo={balanceInfo}
          context={context}
          ethMarketPrice={ethMarketPrice}
          executionPrice={executionPrice}
          autoSellTriggerData={autoSellTriggerData}
          autoBuyTriggerData={autoBuyTriggerData}
          stopLossTriggerData={stopLossTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          stopLossState={stopLossState}
          txHandler={txHandler}
          textButtonHandler={textButtonHandler}
          stage={stage}
          isAddForm={isAddForm}
          isRemoveForm={isRemoveForm}
          isEditing={isEditing}
          isDisabled={isDisabled}
          isFirstSetup={isFirstSetup}
          closePickerConfig={closePickerConfig}
          sliderConfig={sliderConfig}
          isStopLossActive={isStopLossActive}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
