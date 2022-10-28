import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { AddAndRemoveTxHandler } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { getAutoSellMinMaxValues } from 'features/automation/protection/autoSell/helpers'
import { SidebarAutoSellCancelEditingStage } from 'features/automation/protection/autoSell/sidebars/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'features/automation/protection/autoSell/sidebars/SidebarAutoSellAddEditingStage'
import {
  errorsAutoSellValidation,
  warningsAutoSellValidation,
} from 'features/automation/protection/autoSell/validators'
import { VaultType } from 'features/generalManageVault/vaultType'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoSellProps {
  vaultType: VaultType
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
  vaultType,
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
    stopLossTriggerData,
    autoBuyTriggerData,
    constantMultipleTriggerData,
    autoSellTriggerData,
    commonData: {
      positionInfo: { debt, collateralizationRatioAtNextPrice, token, debtFloor, liquidationRatio },
      environmentInfo: { ethBalance, ethMarketPrice, etherscanUrl },
    },
  } = useAutomationContext()

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
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    vaultType,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({ flow, stage, feature })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })
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
    collateralizationRatioAtNextPrice,
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
    constantMultipleTriggerData,
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
              {isAddForm && (
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
              {isRemoveForm && (
                <SidebarAutoSellCancelEditingStage
                  errors={cancelAutoSellErrors}
                  warnings={cancelAutoSellWarnings}
                  autoSellState={autoSellState}
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
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' && {
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
