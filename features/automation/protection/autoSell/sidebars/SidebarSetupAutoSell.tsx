import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
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
import { SidebarAwaitingConfirmation } from 'features/automation/common/sidebars/SidebarAwaitingConfirmation'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getAutoSellMinMaxValues } from 'features/automation/protection/autoSell/helpers'
import { SidebarAutoSellCancelEditingStage } from 'features/automation/protection/autoSell/sidebars/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'features/automation/protection/autoSell/sidebars/SidebarAutoSellAddEditingStage'
import {
  errorsAutoSellValidation,
  warningsAutoSellValidation,
} from 'features/automation/protection/autoSell/validators'
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

import { AutoSellInfoSectionControl } from './AutoSellInfoSectionControl'

interface SidebarSetupAutoSellProps {
  vault: Vault
  vaultType: VaultType
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  autoSellState: AutoBSFormChange
  txHandler: (options?: AddAndRemoveTxHandler) => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isAwaitingConfirmation: boolean
  isFirstSetup: boolean
  debtDelta: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
  feature: AutomationFeatures
}

export function SidebarSetupAutoSell({
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
  isAwaitingConfirmation,
}: SidebarSetupAutoSellProps) {
  const gasEstimation = useGasEstimationContext()

  const { uiChanges } = useAppContext()

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
    etherscan: context.etherscan.url,
    feature,
  })

  const { min, max } = getAutoSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const warnings = warningsAutoSellValidation({
    vault,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: autoSellState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    autoSellState,
    sliderMin: min,
    sliderMax: max,
    debtDeltaAtCurrentCollRatio,
    debtFloor: ilkData.debtFloor,
  })
  const errors = errorsAutoSellValidation({
    ilkData,
    vault,
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
              {isAddForm && !isAwaitingConfirmation && (
                <SidebarAutoSellAddEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  isEditing={isEditing}
                  autoSellState={autoSellState}
                  autoSellTriggerData={autoSellTriggerData}
                  errors={errors}
                  warnings={warnings}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                  stopLossTriggerData={stopLossTriggerData}
                />
              )}
              {isAwaitingConfirmation && (
                <SidebarAwaitingConfirmation
                  feature="Auto-Sell"
                  children={
                    <AutoSellInfoSectionControl
                      autoSellState={autoSellState}
                      vault={vault}
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
                  vault={vault}
                  ilkData={ilkData}
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
