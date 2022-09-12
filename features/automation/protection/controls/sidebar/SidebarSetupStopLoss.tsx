import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/getAutoFeaturesSidebarDropdown'
import { getAutomationFormTitle } from 'features/automation/common/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/getAutomationTextButtonLabel'
import {
  AutomationFeatures,
  SidebarAutomationFlow,
  SidebarAutomationStages,
} from 'features/automation/common/types'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { StopLossFormChange } from 'features/automation/protection/common/UITypes/StopLossFormChange'
import { TAB_CHANGE_SUBJECT } from 'features/automation/protection/common/UITypes/TabChange'
import {
  errorsStopLossValidation,
  warningsStopLossValidation,
} from 'features/automation/protection/common/validation'
import { SidebarCancelStopLossEditingStage } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLossEditingStage'
import { StopLossCompleteInformation } from 'features/automation/protection/controls/StopLossCompleteInformation'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/sidebars/SidebarAutomationFeatureCreationStage'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { extractCancelBSErrors, extractCancelBSWarnings } from 'helpers/messageMappers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { SidebarAdjustStopLossEditingStage } from './SidebarAdjustStopLossEditingStage'

interface SidebarSetupStopLossProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isStopLossActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  stopLossState: StopLossFormChange
  txHandler: ({ callOnSuccess }: { callOnSuccess?: () => void }) => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  closePickerConfig: PickCloseStateProps
  sliderConfig: SliderValuePickerProps
  executionPrice: BigNumber
}

export function SidebarSetupStopLoss({
  vault,
  ilkData,
  balanceInfo,
  context,
  ethMarketPrice,
  executionPrice,

  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,

  stopLossState,
  txHandler,
  textButtonHandler,
  stage,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  isStopLossActive,

  closePickerConfig,
  sliderConfig,
}: SidebarSetupStopLossProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
  const gasEstimationContext = useGasEstimationContext()
  const [, setHash] = useHash()

  const flow: SidebarAutomationFlow = isRemoveForm
    ? 'cancelSl'
    : isFirstSetup
    ? 'addSl'
    : 'adjustSl'
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const errors = errorsStopLossValidation({
    txError: stopLossState.txDetails?.txError,
    debt: vault.debt,
    stopLossLevel: stopLossState.selectedSLValue,
    autoBuyTriggerData,
  })
  const warnings = warningsStopLossValidation({
    token: vault.token,
    gasEstimationUsd: gasEstimationContext?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    sliderMax: sliderConfig.maxBoundry,
    triggerRatio: stopLossState.selectedSLValue,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
  })

  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Protection',
    forcePanel: 'stopLoss',
    disabled: isDropdownDisabled({ stage }),
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
  })

  const cancelStopLossWarnings = extractCancelBSWarnings(warnings)
  const cancelStopLossErrors = extractCancelBSErrors(errors)

  const feature = AutomationFeatures.STOP_LOSS

  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })

  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
  })
  const sidebarStatus = getAutomationStatusTitle({
    flow,
    txHash: stopLossState.txDetails?.txHash,
    etherscan: context.etherscan.url,
    stage,
    feature,
  })

  if (isStopLossActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      ...(basicBSEnabled && { dropdown }),
      content: (
        <Grid gap={3}>
          {stopLossWriteEnabled ? (
            <>
              {(stage === 'stopLossEditing' || stage === 'txFailure') && (
                <>
                  {isAddForm && (
                    <SidebarAdjustStopLossEditingStage
                      vault={vault}
                      ilkData={ilkData}
                      ethMarketPrice={ethMarketPrice}
                      executionPrice={executionPrice}
                      errors={errors}
                      warnings={warnings}
                      stopLossTriggerData={stopLossTriggerData}
                      stopLossState={stopLossState}
                      isEditing={isEditing}
                      closePickerConfig={closePickerConfig}
                      sliderConfig={sliderConfig}
                    />
                  )}
                  {isRemoveForm && (
                    <SidebarCancelStopLossEditingStage
                      vault={vault}
                      ilkData={ilkData}
                      errors={cancelStopLossErrors}
                      warnings={cancelStopLossWarnings}
                      stopLossLevel={stopLossTriggerData.stopLossLevel}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('protection.adding-new-triggers-disabled-description')}
            </Text>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <>
              {(stage === 'txSuccess' || stage === 'txInProgress') && (
                <SidebarAutomationFeatureCreationStage
                  featureName={feature}
                  stage={stage}
                  isAddForm={isAddForm}
                  isRemoveForm={isRemoveForm}
                  customContent={
                    <StopLossCompleteInformation
                      afterStopLossRatio={stopLossState.selectedSLValue}
                      vault={vault}
                      ilkData={ilkData}
                      executionPrice={executionPrice}
                      isCollateralActive={stopLossState.collateralActive}
                      txCost={stopLossState.txDetails?.txCost!}
                    />
                  }
                />
              )}
            </>
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!errors.length,
        isLoading: stage === 'txInProgress',
        action: () =>
          txHandler({
            callOnSuccess: () => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Overview,
              })
              setHash(VaultViewMode.Overview)
            },
          }),
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
