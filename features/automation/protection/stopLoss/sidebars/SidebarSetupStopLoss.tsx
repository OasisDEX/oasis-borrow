import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { useGasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { SidebarAwaitingConfirmation } from 'features/automation/common/sidebars/SidebarAwaitingConfirmation'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  extractAutomationValidations,
  filterAutomationValidations,
} from 'features/automation/common/validation/validation'
import { StopLossCompleteInformation } from 'features/automation/protection/stopLoss/controls/StopLossCompleteInformation'
import {
  SetDownsideProtectionInformation,
  SidebarAdjustStopLossEditingStage,
} from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { SidebarCancelStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarCancelStopLossEditingStage'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { uiChanges } from 'helpers/uiChanges'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

interface SidebarSetupStopLossProps {
  isStopLossActive: boolean
  feature: AutomationFeatures
  stopLossState: StopLossFormChange
  txHandler: ({ callOnSuccess }: { callOnSuccess?: () => void }) => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
}

export function SidebarSetupStopLoss({
  feature,

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
}: SidebarSetupStopLossProps) {
  const { t } = useTranslation()
  const automationContext = useAutomationContext()
  const {
    environmentData: { ethMarketPrice, etherscanUrl },
    metadata: {
      stopLossMetadata: {
        methods: { getExecutionPrice },
        validation: { getAddErrors, getAddWarnings, cancelErrors, cancelWarnings },
        stopLossWriteEnabled,
      },
    },
    positionData: { vaultType },
    protocol,
    triggerData: { autoSellTriggerData, stopLossTriggerData },
  } = automationContext
  const { isAwaitingConfirmation } = stopLossState

  const gasEstimationContext = useGasEstimationContext()
  const [, setHash] = useHash()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Protection',
    forcePanel: AutomationFeatures.STOP_LOSS,
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
  const textButtonLabel = getAutomationTextButtonLabel({
    isAddForm,
    isAwaitingConfirmation,
  })
  const sidebarStatus = getAutomationStatusTitle({
    flow,
    txHash: stopLossState.txDetails?.txHash,
    etherscan: etherscanUrl,
    stage,
    feature,
  })

  const errors = extractAutomationValidations({
    validations: getAddErrors({ state: stopLossState }),
  })
  const warnings = extractAutomationValidations({
    validations: getAddWarnings({
      state: stopLossState,
      gasEstimationUsd: gasEstimationContext?.usdValue,
    }),
  })
  const onCancelErrors = filterAutomationValidations({ messages: errors, toFilter: cancelErrors })
  const onCancelWarnings = filterAutomationValidations({
    messages: errors,
    toFilter: cancelWarnings,
  })

  const executionPrice = getExecutionPrice(stopLossState)

  if (isStopLossActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {stopLossWriteEnabled ? (
            <>
              {(stage === 'stopLossEditing' || stage === 'txFailure') && (
                <>
                  {isAddForm &&
                    !isAwaitingConfirmation &&
                    ['stopLossEditing', 'txFailure'].includes(stage) && (
                      <SidebarAdjustStopLossEditingStage
                        executionPrice={executionPrice}
                        errors={errors}
                        warnings={warnings}
                        stopLossState={stopLossState}
                        isEditing={isEditing}
                      />
                    )}

                  {isAwaitingConfirmation && ['stopLossEditing', 'txFailure'].includes(stage) && (
                    <SidebarAwaitingConfirmation
                      feature="Stop-Loss"
                      children={
                        <SetDownsideProtectionInformation
                          executionPrice={executionPrice}
                          ethPrice={ethMarketPrice}
                          isCollateralActive={stopLossState.collateralActive}
                        />
                      }
                    />
                  )}
                  {isRemoveForm && (
                    <SidebarCancelStopLossEditingStage
                      errors={onCancelErrors}
                      warnings={onCancelWarnings}
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
        disabled: isDisabled || (!!errors.length && stage !== 'txSuccess'),
        isLoading: stage === 'txInProgress',
        action: () => {
          if (!isAwaitingConfirmation && stage !== 'txSuccess' && !isRemoveForm) {
            uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
              type: 'is-awaiting-confirmation',
              isAwaitingConfirmation: true,
            })
          } else {
            if (isAwaitingConfirmation) {
              uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                type: 'is-awaiting-confirmation',
                isAwaitingConfirmation: false,
              })
            }
            txHandler({
              callOnSuccess: () => {
                uiChanges.publish(TAB_CHANGE_SUBJECT, {
                  type: 'change-tab',
                  currentMode: VaultViewMode.Overview,
                })
                setHash(VaultViewMode.Overview)
              },
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
              uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
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
