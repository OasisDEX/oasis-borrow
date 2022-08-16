import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { commonOptimizationDropdownItems } from 'features/automation/optimization/common/dropdown'
import { SidebarConstantMultipleRemovalEditingStage } from 'features/automation/optimization/sidebars/SidebarConstantMultipleRemovalEditingStage'
import {
  errorsConstantMultipleValidation,
  warningsConstantMultipleValidation,
} from 'features/automation/optimization/validators'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/sidebars/SidebarAutomationFeatureCreationStage'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { extractCancelBSErrors, extractCancelBSWarnings } from 'helpers/messageMappers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { SidebarConstantMultipleEditingStage } from './SidebarConstantMultipleEditingStage'

interface SidebarSetupConstantMultipleProps {
  autoBuyTriggerData: BasicBSTriggerData
  autoSellTriggerData: BasicBSTriggerData
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
  stage: SidebarVaultStages
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
}: SidebarSetupConstantMultipleProps) {
  const { t } = useTranslation()

  const gasEstimation = useGasEstimationContext()

  const { uiChanges } = useAppContext()

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const sidebarStatus = getSidebarStatus({
    stage,
    txHash: constantMultipleState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
  })

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })
  const errors = errorsConstantMultipleValidation({ constantMultipleState, isRemoveForm })
  const warnings = warningsConstantMultipleValidation({
    vault,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    sliderMin: constantMultipleState.minTargetRatio,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    constantMultipleState,
  })

  const cancelConstantMultipleErrors = extractCancelBSErrors(errors)
  const cancelConstantMultipleWarnings = extractCancelBSWarnings(warnings)
  const validationErrors = isAddForm ? errors : cancelConstantMultipleErrors

  if (isConstantMultipleActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('constant-multiple.title'),
      dropdown: {
        forcePanel: 'constantMultiple',
        disabled: isDropdownDisabled({ stage }),
        items: commonOptimizationDropdownItems(uiChanges, t),
      },
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarConstantMultipleEditingStage
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
                />
              )}
              {isRemoveForm && (
                <SidebarConstantMultipleRemovalEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelConstantMultipleErrors}
                  warnings={cancelConstantMultipleWarnings}
                  constantMultipleState={constantMultipleState}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutomationFeatureCreationStage
              featureName="Constant Multiple"
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
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
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
