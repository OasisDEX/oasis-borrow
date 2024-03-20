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
import { isOmniAutomationFormEmpty } from 'features/omni-kit/automation/helpers'
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
    environment: { isOpening, productType, settings, networkId },
    automationSteps: { currentStep, setStep },
    tx: { isTxInProgress },
  } = useOmniGeneralContext()
  const {
    automation: { commonForm, automationForms },
  } = useOmniProductContext(productType)
  const [hash] = useHash()

  const isProtection = hash === 'protection'
  const isOptimization = hash === 'optimization'

  const activeUiDropdown = isProtection
    ? commonForm.state.uiDropdownProtection || AutomationFeatures.TRAILING_STOP_LOSS
    : commonForm.state.uiDropdownOptimization || AutomationFeatures.PARTIAL_TAKE_PROFIT

  const currentAutomationForm = automationForms[activeUiDropdown as `${AutomationFeatures}`]

  const availableAutomations = settings.availableAutomations[networkId]

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
                currentAutomationForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                commonForm.updateState(
                  'uiDropdownOptimization',
                  AutomationFeatures.PARTIAL_TAKE_PROFIT,
                )
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
                currentAutomationForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                commonForm.updateState('uiDropdownOptimization', AutomationFeatures.AUTO_BUY)
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
                currentAutomationForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                commonForm.updateState(
                  'uiDropdownProtection',
                  AutomationFeatures.TRAILING_STOP_LOSS,
                )
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
                currentAutomationForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                commonForm.updateState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
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
                currentAutomationForm.dispatch({ type: 'reset' })
                !isTxInProgress && setStep(OmniSidebarAutomationStep.Manage)
                commonForm.updateState('uiDropdownProtection', AutomationFeatures.AUTO_SELL)
              },
            },
          ]
        : []),
    ],
  }

  const forcePanelMap: { [key: string]: AutomationFeatures | undefined } | undefined = {
    optimization: commonForm.state.uiDropdownOptimization,
    protection: commonForm.state.uiDropdownProtection,
  }

  const resolvedAction = commonForm.state.activeAction || currentAutomationForm.state.action

  const isAddOrUpdateAction =
    resolvedAction && [TriggerAction.Add, TriggerAction.Update].includes(resolvedAction)
  const isRemoveAction = resolvedAction === TriggerAction.Remove

  const isFormEmpty = isOmniAutomationFormEmpty(currentAutomationForm.state, activeUiDropdown)

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
        commonForm.updateState('activeTxUiDropdown', undefined)
        commonForm.updateState('activeAction', TriggerAction.Add)
      }}
    >
      {currentStep === OmniSidebarAutomationStep.Manage && isAddOrUpdateAction && (
        <>
          {commonForm.state.uiDropdownProtection === AutomationFeatures.AUTO_SELL &&
            isProtection && <OmniAutoBSSidebarController type={AutomationFeatures.AUTO_SELL} />}
          {commonForm.state.uiDropdownProtection === AutomationFeatures.STOP_LOSS &&
            isProtection && <OmniStopLossSidebarController />}
          {commonForm.state.uiDropdownProtection === AutomationFeatures.TRAILING_STOP_LOSS &&
            isProtection && <OmniTrailingStopLossSidebarController />}
          {commonForm.state.uiDropdownOptimization === AutomationFeatures.AUTO_BUY &&
            isOptimization && <OmniAutoBSSidebarController type={AutomationFeatures.AUTO_BUY} />}
          {commonForm.state.uiDropdownOptimization === AutomationFeatures.PARTIAL_TAKE_PROFIT &&
            isOptimization && <OmniPartialTakeProfitSidebarController />}
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
