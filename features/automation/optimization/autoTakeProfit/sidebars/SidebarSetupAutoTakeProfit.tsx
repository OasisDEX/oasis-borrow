import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { collateralPriceAtRatio, ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { SidebarAutoTakeProfitRemovalEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitRemovalEditingStage'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import {
  errorsAutoTakeProfitValidation,
  warningsAutoTakeProfitValidation,
} from 'features/automation/optimization/autoTakeProfit/validators'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { VaultType } from 'features/generalManageVault/vaultType'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoTakeProfitProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  closePickerConfig: PickCloseStateProps
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  feature: AutomationFeatures
  ilkData: IlkData
  isAddForm: boolean
  isAutoTakeProfitActive: boolean
  isDisabled: boolean
  isEditing: boolean
  isFirstSetup: boolean
  isRemoveForm: boolean
  max: BigNumber
  min: BigNumber
  stage: SidebarAutomationStages
  textButtonHandler: () => void
  tokenMarketPrice: BigNumber
  nextCollateralPrice: BigNumber
  txHandler: () => void
  vault: Vault
  ethBalance: BigNumber
  vaultType: VaultType
}

export function SidebarSetupAutoTakeProfit({
  autoBuyTriggerData,
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  closePickerConfig,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  feature,
  ilkData,
  isAddForm,
  isAutoTakeProfitActive,
  isDisabled,
  isEditing,
  isFirstSetup,
  isRemoveForm,
  max,
  min,
  stage,
  textButtonHandler,
  tokenMarketPrice,
  nextCollateralPrice,
  txHandler,
  vault,
  ethBalance,
  vaultType,
}: SidebarSetupAutoTakeProfitProps) {
  const { uiChanges } = useAppContext()
  const gasEstimation = useGasEstimationContext()
  const { t } = useTranslation()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: AutomationFeatures.AUTO_TAKE_PROFIT,
    disabled: isDropdownDisabled({ stage }),
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    isAutoTakeProfitEnabled: autoTakeProfitTriggerData.isTriggerEnabled,
    vaultType,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })
  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: autoTakeProfitState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
    feature,
  })

  const autoTakeSliderBasicConfig = {
    disabled: false,
    leftBoundryFormatter: (x: BigNumber) =>
      x.isZero() ? '-' : `$${formatAmount(x, 'USD')} ${vault.token}`,
    rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
    step: 1,
  }
  const sliderPercentageFill = getSliderPercentageFill({
    value: autoTakeProfitState.executionPrice,
    min,
    max,
  })
  const targetColRatio = ratioAtCollateralPrice({
    lockedCollateral: vault.lockedCollateral,
    collateralPriceUSD: autoTakeProfitState.executionPrice,
    vaultDebt: vault.debt,
  })

  const warnings = warningsAutoTakeProfitValidation({
    token: vault.token,
    ethPrice: ethMarketPrice,
    ethBalance,
    gasEstimationUsd: gasEstimation?.usdValue,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    executionPrice: autoTakeProfitState.executionPrice,
    autoBuyTriggerPrice: collateralPriceAtRatio({
      colRatio: autoBuyTriggerData.execCollRatio.div(100),
      collateral: vault.lockedCollateral,
      vaultDebt: vault.debt,
    }),
    constantMultipleBuyTriggerPrice: collateralPriceAtRatio({
      colRatio: constantMultipleTriggerData.buyExecutionCollRatio.div(100),
      collateral: vault.lockedCollateral,
      vaultDebt: vault.debt,
    }),
  })

  const errors = errorsAutoTakeProfitValidation({
    nextCollateralPrice,
    executionPrice: autoTakeProfitState.executionPrice,
    txError: autoTakeProfitState.txDetails?.txError,
  })

  const cancelAutoTakeProfitWarnings = extractCancelAutomationWarnings(warnings)
  const cancelAutoTakeProfitErrors = extractCancelAutomationErrors(errors)

  const validationErrors = isAddForm ? errors : cancelAutoTakeProfitErrors

  const sliderConfig: SliderValuePickerProps = {
    ...autoTakeSliderBasicConfig,
    sliderPercentageFill,
    leftLabel: t('slider.set-auto-take-profit.left-label', { token: vault.token }),
    rightLabel: t('slider.set-auto-take-profit.right-label'),
    leftBoundry: autoTakeProfitState.executionPrice,
    rightBoundry: autoTakeProfitState.executionCollRatio,
    lastValue: autoTakeProfitState.executionPrice,
    maxBoundry: max,
    minBoundry: min,
    onChange: (value) => {
      if (autoTakeProfitState.toCollateral === undefined) {
        uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'execution-price',
        executionPrice: value.decimalPlaces(0, BigNumber.ROUND_DOWN),
        executionCollRatio: targetColRatio,
      })
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'is-editing',
        isEditing: true,
      })
    },
  }

  if (isAutoTakeProfitActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarAutoTakeProfitEditingStage
                  autoTakeProfitState={autoTakeProfitState}
                  autoTakeProfitTriggerData={autoTakeProfitTriggerData}
                  closePickerConfig={closePickerConfig}
                  ethMarketPrice={ethMarketPrice}
                  isEditing={isEditing}
                  sliderConfig={sliderConfig}
                  tokenMarketPrice={tokenMarketPrice}
                  vault={vault}
                  ilkData={ilkData}
                  errors={errors}
                  warnings={warnings}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoTakeProfitRemovalEditingStage
                  autoTakeProfitTriggerData={autoTakeProfitTriggerData}
                  errors={cancelAutoTakeProfitErrors}
                  ilkData={ilkData}
                  vault={vault}
                  warnings={cancelAutoTakeProfitWarnings}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutomationFeatureCreationStage
              featureName={feature}
              isAddForm={isAddForm}
              isRemoveForm={isRemoveForm}
              stage={stage}
            />
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!validationErrors.length,
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' &&
        stage !== 'txSuccess' && {
          textButton: {
            label: textButtonLabel,
            hidden: isFirstSetup,
            action: () => textButtonHandler(),
          },
        }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
