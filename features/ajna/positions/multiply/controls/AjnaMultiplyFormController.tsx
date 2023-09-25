import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/positions/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
import { AjnaMultiplyFormContentManage } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentManage'
import { AjnaMultiplyFormContentOpen } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentOpen'
import { AjnaMultiplyFormContentTransition } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentTransition'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { circle_close, circle_exchange, circle_slider } from 'theme/icons'

export function AjnaMultiplyFormController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, flow, quoteToken, collateralIcon, quoteIcon },
    steps: { currentStep },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
  } = useAjnaProductContext('multiply')

  return (
    <AjnaFormView
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
      {currentStep === 'risk' && <AjnaFormContentRisk />}
      {currentStep === 'setup' && <AjnaMultiplyFormContentOpen />}
      {currentStep === 'manage' && <AjnaMultiplyFormContentManage />}
      {currentStep === 'transition' && <AjnaMultiplyFormContentTransition />}
      {currentStep === 'transaction' && (
        <AjnaFormContentTransaction orderInformation={AjnaMultiplyFormOrder} />
      )}
    </AjnaFormView>
  )
}
