import { OmniFormContentTransaction } from 'features/omni-kit/common/sidebars/OmniFormContentTransaction'
import { OmniFormView } from 'features/omni-kit/components/OmniFormView'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniMultiplyFormContentManage } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormContentManage'
import { OmniMultiplyFormContentOpen } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormContentOpen'
import { OmniMultiplyFormContentTransition } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormContentTransition'
import { OmniMultiplyFormOrder } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormOrder'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { circle_close, circle_exchange, circle_slider } from 'theme/icons'

export function OmniMultiplyFormController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, flow, quoteToken, collateralIcon, quoteIcon },
    steps: { currentStep },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
    dynamicMetadata,
  } = useOmniProductContext('multiply')

  const { riskSidebar } = dynamicMetadata('multiply')

  return (
    <OmniFormView
      {...(flow === 'manage' && {
        dropdown: {
          forcePanel: uiDropdown,
          disabled: currentStep !== 'manage',
          items: [
            {
              label: t('system.adjust-position'),
              panel: 'adjust',
              shortLabel: t('adjust'),
              icon: circle_slider,
              iconShrink: 2,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'adjust')
                updateState('action', 'adjust')
              },
            },
            {
              label: t('system.manage-collateral-token', {
                token: collateralToken,
              }),
              panel: 'collateral',
              shortLabel: collateralToken,
              tokenIcon: collateralIcon,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'collateral')
                updateState('uiPill', 'deposit-collateral-multiply')
                updateState('action', 'deposit-collateral-multiply')
              },
            },
            {
              label: t('system.manage-debt-token', {
                token: quoteToken,
              }),
              panel: 'quote',
              shortLabel: quoteToken,
              tokenIcon: quoteIcon,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'quote')
                updateState('uiPill', 'payback-multiply')
                updateState('action', 'payback-multiply')
              },
            },
            {
              label: t('system.actions.multiply.switch-to-borrow'),
              icon: circle_exchange,
              iconShrink: 2,
              panel: 'switch',
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'switch')
                updateState('action', 'switch-multiply')
              },
            },
            {
              label: t('system.actions.common.close-position'),
              icon: circle_close,
              iconShrink: 2,
              panel: 'close',
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'close')
                updateState('closeTo', 'collateral')
                updateState('action', 'close-multiply')
              },
            },
          ],
        },
      })}
    >
      {currentStep === 'risk' && riskSidebar}
      {currentStep === 'setup' && <OmniMultiplyFormContentOpen />}
      {currentStep === 'manage' && <OmniMultiplyFormContentManage />}
      {currentStep === 'transition' && <OmniMultiplyFormContentTransition />}
      {currentStep === 'transaction' && (
        <OmniFormContentTransaction orderInformation={OmniMultiplyFormOrder} />
      )}
    </OmniFormView>
  )
}
