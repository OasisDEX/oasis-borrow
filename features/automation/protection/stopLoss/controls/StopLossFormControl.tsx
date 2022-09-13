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
  MAX_DEBT_FOR_SETTING_STOP_LOSS,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
} from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  getSliderPercentageFill,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import { SidebarSetupStopLoss } from 'features/automation/protection/stopLoss/sidebars/SidebarSetupStopLoss'
import { stopLossSliderBasicConfig } from 'features/automation/protection/stopLoss/sliderConfig'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { getStopLossStatus } from 'features/automation/protection/stopLoss/state/stopLossStatus'
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
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  balanceInfo: BalanceInfo
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isStopLossActive: boolean
  priceInfo: PriceInfo
  shouldRemoveAllowance: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
  vault: Vault
}

export function StopLossFormControl({
  autoBuyTriggerData,
  autoSellTriggerData,
  balanceInfo,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  ilkData,
  isStopLossActive,
  priceInfo: { nextCollateralPrice },
  shouldRemoveAllowance,
  stopLossTriggerData,
  txHelpers,
  vault,
}: StopLossFormControlProps) {
  const { uiChanges } = useAppContext()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  const {
    isAddForm,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    context,
    currentForm: stopLossState.currentForm,
    feature: AutomationFeatures.STOP_LOSS,
    triggersId: [stopLossTriggerData.triggerId],
    txStatus: stopLossState.txDetails?.txStatus,
    vault,
  })
  const { isEditing } = getStopLossStatus({
    stopLossTriggerData,
    stopLossState,
    isRemoveForm,
  })

  const { triggerId, stopLossLevel, isStopLossEnabled, isToCollateral } = stopLossTriggerData

  const token = vault.token
  const tokenData = getToken(token)

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

  const maxDebtForSettingStopLoss = vault.debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)

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
      addTxData={addTxData}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={isStopLossActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      proxyAddress={vault.owner}
      publishType={STOP_LOSS_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[triggerId.toNumber()]}
      txHelpers={txHelpers}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupStopLoss
          autoBuyTriggerData={autoBuyTriggerData}
          autoSellTriggerData={autoSellTriggerData}
          balanceInfo={balanceInfo}
          closePickerConfig={closePickerConfig}
          constantMultipleTriggerData={constantMultipleTriggerData}
          context={context}
          ethMarketPrice={ethMarketPrice}
          executionPrice={executionPrice}
          ilkData={ilkData}
          isAddForm={isAddForm}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          isStopLossActive={isStopLossActive}
          sliderConfig={sliderConfig}
          stage={stage}
          stopLossState={stopLossState}
          stopLossTriggerData={stopLossTriggerData}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
          vault={vault}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
