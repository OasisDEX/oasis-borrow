import { AjnaBorrowFormContentDeposit } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormContentTransition } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentTransition'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { isPoolSupportingMultiply } from 'features/ajna/positions/common/helpers/isPoolSupportingMultiply'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/positions/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_close, circle_exchange } from 'theme/icons'

export function AjnaBorrowFormController() {
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
  } = useAjnaProductContext('borrow')

  return (
    <AjnaFormView
      {...(flow === 'manage' && {
        dropdown: {
          forcePanel: uiDropdown,
          disabled: currentStep !== 'manage',
          items: [
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
                updateState('uiPill', 'deposit-borrow')
                updateState('action', 'deposit-borrow')
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
                updateState('uiPill', 'generate-borrow')
                updateState('action', 'generate-borrow')
              },
            },
            ...(isPoolSupportingMultiply({ collateralToken, quoteToken })
              ? [
                  {
                    label: t('system.actions.borrow.switch-to-multiply'),
                    icon: circle_exchange,
                    iconShrink: 2,
                    panel: 'switch',
                    action: () => {
                      dispatch({ type: 'reset' })
                      updateState('uiDropdown', 'switch')
                      updateState('action', 'switch-borrow')
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
                      updateState('action', 'close-borrow')
                    },
                  },
                  // {
                  //   label: t('system.adjust-position'),
                  //   panel: 'adjust',
                  //   shortLabel: t('adjust'),
                  //   icon: circle_slider,
                  //   iconShrink: 2,
                  //   action: () => {
                  //     dispatch({ type: 'reset' })
                  //     updateState('uiDropdown', 'adjust')
                  //     updateState('action', 'adjust-borrow')
                  //   },
                  // },
                ]
              : []),
          ],
        },
      })}
    >
      {currentStep === 'risk' && <AjnaFormContentRisk />}
      {currentStep === 'setup' && <AjnaBorrowFormContentDeposit />}
      {currentStep === 'manage' && <AjnaBorrowFormContentManage />}
      {currentStep === 'transition' && <AjnaBorrowFormContentTransition />}
      {currentStep === 'transaction' && (
        <AjnaFormContentTransaction orderInformation={AjnaBorrowFormOrder} />
      )}
    </AjnaFormView>
  )
}
