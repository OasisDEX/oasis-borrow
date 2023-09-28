import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { useGasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { SidebarAwaitingConfirmation } from 'features/automation/common/sidebars/SidebarAwaitingConfirmation'
import { AUTO_BUY_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import { AutomationFeatures } from 'features/automation/common/types'
import { getAutoBuyMinMaxValues } from 'features/automation/optimization/autoBuy/helpers'
import { SidebarAutoBuyEditingStage } from 'features/automation/optimization/autoBuy/sidebars/SidebarAutoBuyEditingStage'
import { SidebarAutoBuyRemovalEditingStage } from 'features/automation/optimization/autoBuy/sidebars/SidebarAutoBuyRemovalEditingStage'
import {
  errorsAutoBuyValidation,
  warningsAutoBuyValidation,
} from 'features/automation/optimization/autoBuy/validators'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import { uiChanges } from 'helpers/uiChanges'
import React from 'react'
import { Grid } from 'theme-ui'

import { AutoBuyInfoSectionControl } from './AutoBuyInfoSectionControl'

interface SidebarSetupAutoBuyProps {
  autoBuyState: AutoBSFormChange
  txHandler: () => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  debtDelta: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
  isAutoBuyActive: boolean
  feature: AutomationFeatures
}

export function SidebarSetupAutoBuy({
  feature,

  autoBuyState,
  txHandler,
  textButtonHandler,
  stage,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  debtDelta,
  collateralDelta,
  executionPrice,
  isAutoBuyActive,
}: SidebarSetupAutoBuyProps) {
  const gasEstimation = useGasEstimationContext()
  const {
    environmentData: { ethBalance, ethMarketPrice, etherscanUrl },
    positionData: { nextPositionRatio, token, liquidationRatio, vaultType },
    triggerData: {
      autoBuyTriggerData,
      autoSellTriggerData,
      autoTakeProfitTriggerData,
      constantMultipleTriggerData,
      stopLossTriggerData,
    },
    protocol,
  } = useAutomationContext()

  const { isAwaitingConfirmation } = autoBuyState

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: AutomationFeatures.AUTO_BUY,
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
    txHash: autoBuyState.txDetails?.txHash,
    flow,
    etherscan: etherscanUrl,
    feature,
  })

  const { min, max } = getAutoBuyMinMaxValues({
    autoSellTriggerData,
    stopLossTriggerData,
    liquidationRatio,
  })

  const warnings = warningsAutoBuyValidation({
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: autoBuyState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isAutoTakeProfitEnabled: autoTakeProfitTriggerData.isTriggerEnabled,
    autoBuyState,
    sliderMin: min,
    withThreshold: autoBuyState.withThreshold,
    executionPrice,
    autoTakeProfitExecutionPrice: autoTakeProfitTriggerData.executionPrice,
    token,
    nextPositionRatio,
  })
  const errors = errorsAutoBuyValidation({
    autoBuyState,
    autoSellTriggerData,
    constantMultipleTriggerData,
    isRemoveForm,
    executionPrice,
  })
  const cancelAutoBuyWarnings = extractCancelAutomationWarnings(warnings)
  const cancelAutoBuyErrors = extractCancelAutomationErrors(errors)
  const validationErrors = isAddForm ? errors : cancelAutoBuyErrors

  if (isAutoBuyActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && !isAwaitingConfirmation && (
                <SidebarAutoBuyEditingStage
                  autoBuyState={autoBuyState}
                  isEditing={isEditing}
                  errors={errors}
                  warnings={warnings}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                />
              )}
              {isAwaitingConfirmation && !isRemoveForm && (
                <SidebarAwaitingConfirmation
                  feature="Auto-Buy"
                  children={
                    <AutoBuyInfoSectionControl
                      executionPrice={executionPrice}
                      autoBuyState={autoBuyState}
                      debtDelta={debtDelta}
                      collateralDelta={collateralDelta}
                    />
                  }
                />
              )}
              {isRemoveForm && (
                <SidebarAutoBuyRemovalEditingStage
                  errors={cancelAutoBuyErrors}
                  warnings={cancelAutoBuyWarnings}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutomationFeatureCreationStage
              featureName={feature}
              stage={stage}
              isAddForm={isAddForm}
              isRemoveForm={isRemoveForm}
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
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'is-awaiting-confirmation',
              isAwaitingConfirmation: true,
            })
          } else {
            if (isAwaitingConfirmation) {
              uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
                type: 'is-awaiting-confirmation',
                isAwaitingConfirmation: false,
              })
            }
            txHandler()
          }
        },
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: textButtonLabel,
          hidden: isFirstSetup && !isAwaitingConfirmation,
          action: () => {
            if (isAwaitingConfirmation) {
              uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
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
