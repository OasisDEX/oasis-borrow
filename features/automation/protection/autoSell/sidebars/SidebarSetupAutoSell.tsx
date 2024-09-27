import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { useGasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { AddAndRemoveTxHandler } from 'features/automation/common/controls/AddAndRemoveTriggerControl.types'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { SidebarAwaitingConfirmation } from 'features/automation/common/sidebars/SidebarAwaitingConfirmation'
import { AUTO_SELL_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import { AutomationFeatures } from 'features/automation/common/types'
import { getAutoSellMinMaxValues } from 'features/automation/protection/autoSell/helpers'
import { SidebarAutoSellCancelEditingStage } from 'features/automation/protection/autoSell/sidebars/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'features/automation/protection/autoSell/sidebars/SidebarAutoSellAddEditingStage'
import {
  errorsAutoSellValidation,
  warningsAutoSellValidation,
} from 'features/automation/protection/autoSell/validators'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import { uiChanges } from 'helpers/uiChanges'
import React from 'react'
import { Grid } from 'theme-ui'

import { AutoSellInfoSectionControl } from './AutoSellInfoSectionControl'

interface SidebarSetupAutoSellProps {
  isAutoSellActive: boolean
  autoSellState: AutoBSFormChange
  txHandler: (options?: AddAndRemoveTxHandler) => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  debtDelta: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
  feature: AutomationFeatures
}

export function SidebarSetupAutoSell({
  feature,

  isAutoSellActive,
  autoSellState,
  txHandler,
  textButtonHandler,
  stage,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  debtDelta,
  debtDeltaAtCurrentCollRatio,
  collateralDelta,
  executionPrice,
}: SidebarSetupAutoSellProps) {
  const gasEstimation = useGasEstimationContext()
  const {
    environmentData: { ethBalance, ethMarketPrice, etherscanUrl },
    positionData: { nextPositionRatio, debt, debtFloor, liquidationRatio, token, vaultType },
    protocol,
    triggerData: { autoBuyTriggerData, autoSellTriggerData, stopLossTriggerData },
  } = useAutomationContext()

  const { isAwaitingConfirmation } = autoSellState

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Protection',
    forcePanel: AutomationFeatures.AUTO_SELL,
    disabled: isDropdownDisabled({ stage }),
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
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
    txHash: autoSellState.txDetails?.txHash,
    flow,
    etherscan: etherscanUrl,
    feature,
  })

  const { min, max } = getAutoSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    liquidationRatio,
  })

  const warnings = warningsAutoSellValidation({
    debt,
    nextPositionRatio,
    token,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: autoSellState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    autoSellState,
    sliderMin: min,
    sliderMax: max,
    debtDeltaAtCurrentCollRatio,
    debtFloor,
  })
  const errors = errorsAutoSellValidation({
    debt,
    debtFloor,
    debtDelta,
    executionPrice,
    debtDeltaAtCurrentCollRatio,
    autoSellState,
    autoBuyTriggerData,
    isRemoveForm,
  })
  const cancelAutoSellWarnings = extractCancelAutomationWarnings(warnings)
  const cancelAutoSellErrors = extractCancelAutomationErrors(errors)
  const validationErrors = isAddForm ? errors : cancelAutoSellErrors

  if (isAutoSellActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && !isAwaitingConfirmation && (
                <SidebarAutoSellAddEditingStage
                  isEditing={isEditing}
                  autoSellState={autoSellState}
                  errors={errors}
                  warnings={warnings}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                />
              )}
              {isAwaitingConfirmation && (
                <SidebarAwaitingConfirmation
                  feature="Auto-Sell"
                  children={
                    <AutoSellInfoSectionControl
                      autoSellState={autoSellState}
                      debtDelta={debtDelta}
                      collateralDelta={collateralDelta}
                      executionPrice={executionPrice}
                      maxGasFee={autoSellState.maxBaseFeeInGwei.toNumber()}
                    />
                  }
                />
              )}
              {isRemoveForm && (
                <SidebarAutoSellCancelEditingStage
                  errors={cancelAutoSellErrors}
                  warnings={cancelAutoSellWarnings}
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
            uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
              type: 'is-awaiting-confirmation',
              isAwaitingConfirmation: true,
            })
          } else {
            txHandler()
            uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
              type: 'is-awaiting-confirmation',
              isAwaitingConfirmation: false,
            })
          }
        },
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: textButtonLabel,
          hidden: isFirstSetup && !isAwaitingConfirmation,
          action: () => {
            if (isAwaitingConfirmation) {
              uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
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
