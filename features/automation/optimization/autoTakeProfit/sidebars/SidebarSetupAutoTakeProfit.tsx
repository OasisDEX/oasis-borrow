import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio, ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { useAutomationContext, useGasEstimationContext } from 'components/context'
import type { PickCloseStateProps } from 'components/dumb/PickCloseState'
import type { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { getOnCloseEstimations } from 'features/automation/common/estimations/onCloseEstimations'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { SidebarAwaitingConfirmation } from 'features/automation/common/sidebars/SidebarAwaitingConfirmation'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoTakeProfitInfoSectionControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitInfoSectionControl'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { SidebarAutoTakeProfitRemovalEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitRemovalEditingStage'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import type { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.types'
import {
  errorsAutoTakeProfitValidation,
  warningsAutoTakeProfitValidation,
} from 'features/automation/optimization/autoTakeProfit/validators'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { formatAmount } from 'helpers/formatters/format'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import { uiChanges } from 'helpers/uiChanges'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

interface SidebarSetupAutoTakeProfitProps {
  autoTakeProfitState: AutoTakeProfitFormChange
  closePickerConfig: PickCloseStateProps
  feature: AutomationFeatures
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
  txHandler: () => void
}

export function SidebarSetupAutoTakeProfit({
  autoTakeProfitState,
  closePickerConfig,
  feature,
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
  txHandler,
}: SidebarSetupAutoTakeProfitProps) {
  const gasEstimation = useGasEstimationContext()
  const { t } = useTranslation()

  const {
    environmentData: { ethMarketPrice, etherscanUrl, nextCollateralPrice, ethBalance },
    positionData: { debt, debtOffset, token, vaultType, lockedCollateral },
    protocol,
    triggerData: { autoBuyTriggerData, autoTakeProfitTriggerData, constantMultipleTriggerData },
  } = useAutomationContext()

  const { isAwaitingConfirmation } = autoTakeProfitState

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
    protocol,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
    isAwaitingConfirmation,
    isRemoveForm,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm, isAwaitingConfirmation })
  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: autoTakeProfitState.txDetails?.txHash,
    flow,
    etherscan: etherscanUrl,
    feature,
  })

  const { estimatedProfitOnClose } = getOnCloseEstimations({
    colMarketPrice: autoTakeProfitState.executionPrice,
    colOraclePrice: autoTakeProfitState.executionPrice,
    debt: debt,
    debtOffset: debtOffset,
    ethMarketPrice,
    lockedCollateral,
    toCollateral: autoTakeProfitState.toCollateral,
  })

  const closeToToken = autoTakeProfitState.toCollateral ? token : 'DAI'

  const autoTakeSliderBasicConfig = {
    disabled: false,
    leftBoundryFormatter: (x: BigNumber) =>
      x.isZero() ? '-' : `$${formatAmount(x, 'USD')} ${token}`,
    rightBoundryFormatter: (x: BigNumber) =>
      x.isZero() ? '-' : `${formatAmount(estimatedProfitOnClose, closeToToken)} ${closeToToken}`,
    step: 1,
  }
  const sliderPercentageFill = getSliderPercentageFill({
    value: autoTakeProfitState.executionPrice,
    min,
    max,
  })
  const targetColRatio = ratioAtCollateralPrice({
    lockedCollateral,
    collateralPriceUSD: autoTakeProfitState.executionPrice,
    vaultDebt: debt,
  })

  const warnings = warningsAutoTakeProfitValidation({
    token,
    ethPrice: ethMarketPrice,
    ethBalance,
    gasEstimationUsd: gasEstimation?.usdValue,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    executionPrice: autoTakeProfitState.executionPrice,
    autoBuyTriggerPrice: collateralPriceAtRatio({
      colRatio: autoBuyTriggerData.execCollRatio.div(100),
      collateral: lockedCollateral,
      vaultDebt: debt,
    }),
    constantMultipleBuyTriggerPrice: collateralPriceAtRatio({
      colRatio: constantMultipleTriggerData.buyExecutionCollRatio.div(100),
      collateral: lockedCollateral,
      vaultDebt: debt,
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
    leftLabel: t('slider.set-auto-take-profit.left-label', { token }),
    rightLabel: t('slider.set-auto-take-profit.right-label', { token: closeToToken }),
    leftBoundry: autoTakeProfitState.executionPrice,
    rightBoundry: estimatedProfitOnClose,
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
              {isAddForm && !isAwaitingConfirmation && (
                <SidebarAutoTakeProfitEditingStage
                  autoTakeProfitState={autoTakeProfitState}
                  closePickerConfig={closePickerConfig}
                  isEditing={isEditing}
                  sliderConfig={sliderConfig}
                  errors={errors}
                  warnings={warnings}
                />
              )}
              {isAwaitingConfirmation && (
                <SidebarAwaitingConfirmation
                  feature={
                    <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
                      {t('auto-take-profit.auto-take-profit-confirmation-text', {
                        price: ethMarketPrice.toString(),
                        profit: estimatedProfitOnClose.toFixed(2).toString(),
                      })}
                    </Text>
                  }
                  children={
                    <AutoTakeProfitInfoSectionControl
                      toCollateral={autoTakeProfitState.toCollateral}
                      triggerColPrice={autoTakeProfitState.executionPrice}
                      triggerColRatio={autoTakeProfitState.executionCollRatio}
                    />
                  }
                />
              )}
              {isRemoveForm && (
                <SidebarAutoTakeProfitRemovalEditingStage
                  errors={cancelAutoTakeProfitErrors}
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
        action: () => {
          if (!isAwaitingConfirmation && stage !== 'txSuccess' && !isRemoveForm) {
            uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
              type: 'is-awaiting-confirmation',
              isAwaitingConfirmation: true,
            })
          } else {
            if (isAwaitingConfirmation && ['txSuccess', 'txFailure'].includes(stage)) {
              uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
                type: 'is-awaiting-confirmation',
                isAwaitingConfirmation: false,
              })
            }

            txHandler()
          }
        },
      },
      ...(stage !== 'txInProgress' &&
        stage !== 'txSuccess' && {
          textButton: {
            label: textButtonLabel,
            hidden: isFirstSetup && !isAwaitingConfirmation,
            action: () => {
              if (isAwaitingConfirmation) {
                uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
                  type: 'is-awaiting-confirmation',
                  isAwaitingConfirmation: false,
                })
              } else {
                textButtonHandler()
              }
            },
          },
        }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
