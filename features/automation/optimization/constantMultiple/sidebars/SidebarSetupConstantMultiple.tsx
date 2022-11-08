import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { SidebarAwaitingConfirmation } from 'features/automation/common/sidebars/SidebarAwaitingConfirmation'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { SidebarConstantMultipleEditingStage } from 'features/automation/optimization/constantMultiple/sidebars/SidebarConstantMultipleEditingStage'
import { SidebarConstantMultipleRemovalEditingStage } from 'features/automation/optimization/constantMultiple/sidebars/SidebarConstantMultipleRemovalEditingStage'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  errorsConstantMultipleValidation,
  warningsConstantMultipleValidation,
} from 'features/automation/optimization/constantMultiple/validators'
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

import { ConstantMultipleInfoSectionControl } from './ConstantMultipleInfoSectionControl'

interface SidebarSetupConstantMultipleProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
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
  feature: AutomationFeatures
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
  vaultType: VaultType
  isAwaitingConfirmation: boolean
}

export function SidebarSetupConstantMultiple({
  autoBuyTriggerData,
  autoSellTriggerData,
  autoTakeProfitTriggerData,
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
  feature,
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
  vaultType,
  isAwaitingConfirmation,
}: SidebarSetupConstantMultipleProps) {
  const gasEstimation = useGasEstimationContext()
  const { uiChanges } = useAppContext()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: AutomationFeatures.CONSTANT_MULTIPLE,
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
    isAwaitingConfirmation,
    isRemoveForm,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm, isAwaitingConfirmation })
  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: constantMultipleState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
    feature,
  })

  const errors = errorsConstantMultipleValidation({
    constantMultipleState,
    isRemoveForm,
    debtDeltaWhenSellAtCurrentCollRatio,
    debtDeltaAfterSell,
    debtFloor: ilkData.debtFloor,
    debt: vault.debt,
    nextBuyPrice,
    nextSellPrice,
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
    isAutoTakeProfitEnabled: autoTakeProfitTriggerData.isTriggerEnabled,
    constantMultipleState,
    debtDeltaWhenSellAtCurrentCollRatio,
    constantMultipleBuyExecutionPrice: nextBuyPrice,
    autoTakeProfitExecutionPrice: autoTakeProfitTriggerData.executionPrice,
  })
  const cancelConstantMultipleErrors = extractCancelAutomationErrors(errors)
  const cancelConstantMultipleWarnings = extractCancelAutomationWarnings(warnings)
  const validationErrors = isAddForm ? errors : cancelConstantMultipleErrors

  if (isConstantMultipleActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && !isAwaitingConfirmation && (
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

              {isAwaitingConfirmation && (
                <SidebarAwaitingConfirmation
                  feature={'Constant-Multiple'}
                  children={
                    <ConstantMultipleInfoSectionControl
                      token={vault.token}
                      nextBuyPrice={nextBuyPrice}
                      nextSellPrice={nextSellPrice}
                      collateralToBePurchased={collateralToBePurchased}
                      collateralToBeSold={collateralToBeSold}
                      estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
                      estimatedBuyFee={estimatedBuyFee}
                      estimatedSellFee={estimatedSellFee}
                      constantMultipleState={constantMultipleState}
                    />
                  }
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
        action: () => {
          if (!isAwaitingConfirmation && stage !== 'txSuccess' && !isRemoveForm) {
            uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
              type: 'is-awaiting-confirmation',
              isAwaitingConfirmation: true,
            })
          } else {
            if (isAwaitingConfirmation && ['txSuccess', 'txFailure'].includes(stage)) {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
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
                uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
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
