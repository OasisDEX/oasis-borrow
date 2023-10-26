import { OmniFormContentTransaction } from 'features/omni-kit/components/sidebars'
import {
  OmniMultiplyFormContentManage,
  OmniMultiplyFormContentOpen,
  OmniMultiplyFormContentTransition,
  OmniMultiplyFormOrder,
} from 'features/omni-kit/components/sidebars/multiply'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniMultiplyFormAction, OmniMultiplyPanel, OmniProductType, OmniSidebarStep } from 'features/omni-kit/types'
import { OmniFormView } from 'features/omni-kit/views'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { circle_close, circle_exchange, circle_slider } from 'theme/icons'

export function OmniMultiplyFormController({ txHandler }: { txHandler: () => () => void }) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, isOpening, quoteToken, collateralIcon, quoteIcon },
    steps: { currentStep },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
    dynamicMetadata: {
      elements: { riskSidebar },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  return (
    <OmniFormView
      {...(!isOpening && {
        dropdown: {
          forcePanel: uiDropdown,
          disabled: currentStep !== OmniSidebarStep.Manage,
          items: [
            {
              label: t('system.adjust-position'),
              panel: OmniMultiplyPanel.Adjust,
              shortLabel: t('adjust'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniMultiplyPanel.Adjust)
                updateState('action', OmniMultiplyFormAction.AdjustMultiply)
              },
            },
            {
              label: t('system.manage-collateral-token', {
                token: collateralToken,
              }),
              panel: OmniMultiplyPanel.Collateral,
              shortLabel: collateralToken,
              tokenIcon: collateralIcon,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniMultiplyPanel.Collateral)
                updateState('uiPill', OmniMultiplyFormAction.DepositCollateralMultiply)
                updateState('action', OmniMultiplyFormAction.DepositCollateralMultiply)
              },
            },
            {
              label: t('system.manage-debt-token', {
                token: quoteToken,
              }),
              panel: OmniMultiplyPanel.Quote,
              shortLabel: quoteToken,
              tokenIcon: quoteIcon,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniMultiplyPanel.Quote)
                updateState('uiPill', OmniMultiplyFormAction.PaybackMultiply)
                updateState('action', OmniMultiplyFormAction.PaybackMultiply)
              },
            },
            {
              label: t('system.actions.multiply.switch-to-borrow'),
              icon: circle_exchange,
              iconShrink: 2,
              panel: OmniMultiplyPanel.Switch,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniMultiplyPanel.Switch)
                updateState('action', OmniMultiplyFormAction.SwitchMultiply)
              },
            },
            {
              label: t('system.actions.common.close-position'),
              icon: circle_close,
              iconShrink: 2,
              panel: OmniMultiplyPanel.Close,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniMultiplyPanel.Close)
                updateState('closeTo', 'collateral')
                updateState('action', OmniMultiplyFormAction.CloseMultiply)
              },
            },
          ],
        },
      })}
      txHandler={txHandler}
    >
      {currentStep === OmniSidebarStep.Risk && riskSidebar}
      {currentStep === OmniSidebarStep.Setup && <OmniMultiplyFormContentOpen />}
      {currentStep === OmniSidebarStep.Manage && <OmniMultiplyFormContentManage />}
      {currentStep === OmniSidebarStep.Transition && <OmniMultiplyFormContentTransition />}
      {currentStep === OmniSidebarStep.Transaction && (
        <OmniFormContentTransaction orderInformation={OmniMultiplyFormOrder} />
      )}
    </OmniFormView>
  )
}
