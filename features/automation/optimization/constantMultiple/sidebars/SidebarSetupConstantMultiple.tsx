import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import {
  AutomationFeatures,
  SidebarAutomationFlow,
  SidebarAutomationStages,
} from 'features/automation/common/types'
import { SidebarConstantMultipleEditingStage } from 'features/automation/optimization/constantMultiple/sidebars/SidebarConstantMultipleEditingStage'
import { SidebarConstantMultipleRemovalEditingStage } from 'features/automation/optimization/constantMultiple/sidebars/SidebarConstantMultipleRemovalEditingStage'
import { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  errorsConstantMultipleValidation,
  warningsConstantMultipleValidation,
} from 'features/automation/optimization/constantMultiple/validators'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { extractCancelBSErrors, extractCancelBSWarnings } from 'helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupConstantMultipleProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  balanceInfo: BalanceInfo
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  constantMultipleState: ConstantMultipleFormChange
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  estimatedBuyFee: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedSellFee: BigNumber
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isAddForm: boolean
  isConstantMultipleActive: boolean
  isDisabled: boolean
  isEditing: boolean
  isFirstSetup: boolean
  isRemoveForm: boolean
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
  debtDeltaAfterSell: BigNumber
  stage: SidebarAutomationStages
  stopLossTriggerData: StopLossTriggerData
  textButtonHandler: () => void
  txHandler: () => void
  vault: Vault
}

export function SidebarSetupConstantMultiple({
  autoBuyTriggerData,
  autoSellTriggerData,
  balanceInfo,
  collateralToBePurchased,
  collateralToBeSold,
  constantMultipleState,
  constantMultipleTriggerData,
  context,
  estimatedBuyFee,
  estimatedGasCostOnTrigger,
  estimatedSellFee,
  ethMarketPrice,
  ilkData,
  isAddForm,
  isConstantMultipleActive,
  isDisabled,
  isEditing,
  isFirstSetup,
  isRemoveForm,
  nextBuyPrice,
  nextSellPrice,
  stage,
  stopLossTriggerData,
  textButtonHandler,
  txHandler,
  vault,
  debtDeltaWhenSellAtCurrentCollRatio,
  debtDeltaAfterSell,
}: SidebarSetupConstantMultipleProps) {
  const gasEstimation = useGasEstimationContext()

  const flow: SidebarAutomationFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const feature = AutomationFeatures.CONSTANT_MULTIPLE

  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: constantMultipleState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
    feature,
  })

  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })

  const errors = errorsConstantMultipleValidation({
    constantMultipleState,
    isRemoveForm,
    debtDeltaWhenSellAtCurrentCollRatio,
    debtDeltaAfterSell,
    debtFloor: ilkData.debtFloor,
    debt: vault.debt,
  })
  const warnings = warningsConstantMultipleValidation({
    vault,
    debtFloor: ilkData.debtFloor,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    sliderMin: constantMultipleState.minTargetRatio,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    constantMultipleState,
    debtDeltaWhenSellAtCurrentCollRatio,
  })

  const cancelConstantMultipleErrors = extractCancelBSErrors(errors)
  const cancelConstantMultipleWarnings = extractCancelBSWarnings(warnings)
  const validationErrors = isAddForm ? errors : cancelConstantMultipleErrors

  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: 'constantMultiple',
    disabled: isDropdownDisabled({ stage }),
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
  })

  if (isConstantMultipleActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarConstantMultipleEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  isEditing={isEditing}
                  autoBuyTriggerData={autoBuyTriggerData}
                  errors={errors}
                  warnings={warnings}
                  token={vault.token}
                  constantMultipleState={constantMultipleState}
                  autoSellTriggerData={autoSellTriggerData}
                  constantMultipleTriggerData={constantMultipleTriggerData}
                  nextBuyPrice={nextBuyPrice}
                  nextSellPrice={nextSellPrice}
                  collateralToBePurchased={collateralToBePurchased}
                  collateralToBeSold={collateralToBeSold}
                  estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
                  estimatedBuyFee={estimatedBuyFee}
                  estimatedSellFee={estimatedSellFee}
                  stopLossTriggerData={stopLossTriggerData}
                />
              )}
              {isRemoveForm && (
                <SidebarConstantMultipleRemovalEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelConstantMultipleErrors}
                  warnings={cancelConstantMultipleWarnings}
                  constantMultipleTriggerData={constantMultipleTriggerData}
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
