import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { getAutoBuyMinMaxValues } from 'features/automation/optimization/autoBuy/helpers'
import { SidebarAutoBuyEditingStage } from 'features/automation/optimization/autoBuy/sidebars/SidebarAutoBuyEditingStage'
import { SidebarAutoBuyRemovalEditingStage } from 'features/automation/optimization/autoBuy/sidebars/SidebarAutoBuyRemovalEditingStage'
import {
  errorsAutoBuyValidation,
  warningsAutoBuyValidation,
} from 'features/automation/optimization/autoBuy/validators'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultType } from 'features/generalManageVault/vaultType'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  vault: Vault
  vaultType: VaultType
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  isAutoBuyOn: boolean
  context: Context
  ethMarketPrice: BigNumber
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
  vault,
  vaultType,
  ilkData,
  balanceInfo,
  context,
  ethMarketPrice,
  feature,

  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,
  autoTakeProfitTriggerData,

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
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({ flow, stage, feature })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })
  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: autoBuyState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
    feature,
  })

  const { min, max } = getAutoBuyMinMaxValues({
    autoSellTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const warnings = warningsAutoBuyValidation({
    vault,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
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
              {isAddForm && (
                <SidebarAutoBuyEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  autoBuyState={autoBuyState}
                  isEditing={isEditing}
                  autoBuyTriggerData={autoBuyTriggerData}
                  errors={errors}
                  warnings={warnings}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                  stopLossTriggerData={stopLossTriggerData}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoBuyRemovalEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelAutoBuyErrors}
                  warnings={cancelAutoBuyWarnings}
                  autoBuyState={autoBuyState}
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
