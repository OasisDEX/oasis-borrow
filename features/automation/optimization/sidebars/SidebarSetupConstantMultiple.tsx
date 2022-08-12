import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { commonOptimizationDropdownItems } from 'features/automation/optimization/common/dropdown'
import { warningsConstantMultipleValidation } from 'features/automation/optimization/validators'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleEditingStage } from './ConstantMultipleEditingStage'

interface SidebarSetupConstantMultipleProps {
  vault: Vault
  balanceInfo: BalanceInfo
  stage: SidebarVaultStages
  constantMultipleState: ConstantMultipleFormChange
  isAddForm: boolean
  isRemoveForm: boolean
  // isEditing: boolean //TODO ŁW, will be used in middle stages
  isDisabled: boolean
  isFirstSetup: boolean
  txHandler: () => void
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  autoSellTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  ethMarketPrice: BigNumber
  isEditing: boolean
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
}

export function SidebarSetupConstantMultiple({
  vault,
  balanceInfo,
  isAddForm,
  isRemoveForm,
  isDisabled,
  isFirstSetup,
  stage,
  constantMultipleState,
  txHandler,
  ilkData,
  autoBuyTriggerData,
  autoSellTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,
  ethMarketPrice,
  isEditing,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
}: SidebarSetupConstantMultipleProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()
  const gasEstimation = useGasEstimationContext()

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })

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

  if (activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple') {
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
              <ConstantMultipleEditingStage
                ilkData={ilkData}
                isEditing={isEditing}
                autoBuyTriggerData={autoBuyTriggerData}
                // errors={[]}
                warnings={warnings}
                token={''}
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
            </>
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled /*|| !!errors.length*/ && stage !== 'txSuccess',
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
          hidden: true,
          action: () => textButtonHandler(),
        },
      }),
      // TODO ŁW status:
    }
    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}

function textButtonHandler(): void {
  alert('switch to remove')
}
