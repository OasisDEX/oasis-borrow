import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  OmniAutoBSSidebarController,
  OmniPartialTakeProfitSidebarController,
  OmniStopLossSidebarController,
  OmniTrailingStopLossSidebarController,
} from 'features/omni-kit/automation/components'
import {
  OmniAutomationAddUpdateTriggerSidebar,
  OmniAutomationRemoveTriggerSidebar,
} from 'features/omni-kit/automation/components/common'
import { OmniAutomationFromOrder } from 'features/omni-kit/automation/components/common/OmniAutomationFromOrder'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import { OmniAutomationFormView } from 'features/omni-kit/views'
import { TriggerAction } from 'helpers/triggers'
import { useHash } from 'helpers/useHash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { circle_slider } from 'theme/icons'

export function OmniAutomationFormController() {
  const { t } = useTranslation()
  const {
    environment: { isOpening, productType },
    automationSteps: { currentStep, setStep },
    tx: { isTxInProgress },
  } = useOmniGeneralContext()
  const {
    automation: {
      availableAutomations,
      commonForm: {
        updateState,
        state: { uiDropdownProtection, uiDropdownOptimization, activeAction },
      },
    },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)
  const [hash] = useHash()

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const { activeForm, isOptimization, isProtection } = automation.resolved

  const itemsMap: { [key: string]: SidebarSectionHeaderSelectItem[] } | undefined = {
    optimization: [
      ...(availableAutomations?.includes(AutomationFeatures.PARTIAL_TAKE_PROFIT)
        ? [
            {
              label: t('system.partial-take-profit'),
              panel: AutomationFeatures.PARTIAL_TAKE_PROFIT,
              shortLabel: t('system.partial-take-profit'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                activeForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                updateState('uiDropdownOptimization', AutomationFeatures.PARTIAL_TAKE_PROFIT)
              },
            },
          ]
        : []),
      ...(availableAutomations?.includes(AutomationFeatures.AUTO_BUY)
        ? [
            {
              label: t('auto-buy.title'),
              panel: AutomationFeatures.AUTO_BUY,
              shortLabel: t('auto-buy.title'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                activeForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                updateState('uiDropdownOptimization', AutomationFeatures.AUTO_BUY)
              },
            },
          ]
        : []),
    ],
    protection: [
      ...(availableAutomations?.includes(AutomationFeatures.TRAILING_STOP_LOSS)
        ? [
            {
              label: t('system.trailing-stop-loss'),
              panel: AutomationFeatures.TRAILING_STOP_LOSS,
              shortLabel: t('system.trailing-stop-loss'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                activeForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                updateState('uiDropdownProtection', AutomationFeatures.TRAILING_STOP_LOSS)
              },
            },
          ]
        : []),
      ...(availableAutomations?.includes(AutomationFeatures.STOP_LOSS)
        ? [
            {
              label: t('system.stop-loss'),
              panel: AutomationFeatures.STOP_LOSS,
              shortLabel: t('system.stop-loss'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                activeForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                updateState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
              },
            },
          ]
        : []),
      ...(availableAutomations?.includes(AutomationFeatures.AUTO_SELL)
        ? [
            {
              label: t('auto-sell.title'),
              panel: AutomationFeatures.AUTO_SELL,
              shortLabel: t('auto-sell.title'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                activeForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                updateState('uiDropdownProtection', AutomationFeatures.AUTO_SELL)
              },
            },
          ]
        : []),
    ],
  }

  const forcePanelMap: { [key: string]: AutomationFeatures | undefined } | undefined = {
    optimization: uiDropdownOptimization,
    protection: uiDropdownProtection,
  }

  const resolvedAction = activeAction || activeForm.state.action

  const isAddOrUpdateAction =
    resolvedAction && [TriggerAction.Add, TriggerAction.Update].includes(resolvedAction)
  const isRemoveAction = resolvedAction === TriggerAction.Remove

  const isFormEmpty = automation.resolved.isFormEmpty

  return (
    <OmniAutomationFormView
      {...(!isOpening && {
        dropdown: {
          forcePanel: forcePanelMap[hash],
          disabled: currentStep !== OmniSidebarAutomationStep.Manage,
          items: itemsMap[hash] || [],
        },
      })}
      txSuccessAction={() => {
        updateState('activeTxUiDropdown', undefined)
        updateState('activeAction', TriggerAction.Add)
      }}
    >
      {currentStep === OmniSidebarAutomationStep.Manage && isAddOrUpdateAction && (
        <>
          {uiDropdownProtection === AutomationFeatures.AUTO_SELL && isProtection && (
            <OmniAutoBSSidebarController type={AutomationFeatures.AUTO_SELL} />
          )}
          {uiDropdownProtection === AutomationFeatures.STOP_LOSS && isProtection && (
            <OmniStopLossSidebarController />
          )}
          {uiDropdownProtection === AutomationFeatures.TRAILING_STOP_LOSS && isProtection && (
            <OmniTrailingStopLossSidebarController />
          )}
          {uiDropdownOptimization === AutomationFeatures.AUTO_BUY && isOptimization && (
            <OmniAutoBSSidebarController type={AutomationFeatures.AUTO_BUY} />
          )}
          {uiDropdownOptimization === AutomationFeatures.PARTIAL_TAKE_PROFIT && isOptimization && (
            <OmniPartialTakeProfitSidebarController />
          )}
          {!isFormEmpty && <OmniAutomationFromOrder />}
        </>
      )}
      {currentStep === OmniSidebarAutomationStep.Transaction && isAddOrUpdateAction && (
        <OmniAutomationAddUpdateTriggerSidebar />
      )}
      {currentStep === OmniSidebarAutomationStep.Transaction && isRemoveAction && (
        <OmniAutomationRemoveTriggerSidebar />
      )}
    </OmniAutomationFormView>
  )
}
