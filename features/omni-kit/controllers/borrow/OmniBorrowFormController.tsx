import { isPoolSupportingMultiply } from 'features/ajna/positions/common/helpers/isPoolSupportingMultiply'
import { OmniFormContentRisk } from 'features/omni-kit/common/sidebars/OmniFormContentRisk'
import { OmniFormContentTransaction } from 'features/omni-kit/common/sidebars/OmniFormContentTransaction'
import { OmniFormView } from 'features/omni-kit/components/OmniFormView'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowFormContentDeposit } from 'features/omni-kit/sidebars/borrow/OmniBorrowFormContentDeposit'
import { OmniBorrowFormContentManage } from 'features/omni-kit/sidebars/borrow/OmniBorrowFormContentManage'
import { OmniBorrowFormContentTransition } from 'features/omni-kit/sidebars/borrow/OmniBorrowFormContentTransition'
import { OmniBorrowFormOrder } from 'features/omni-kit/sidebars/borrow/OmniBorrowFormOrder'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_close, circle_exchange } from 'theme/icons'

export function OmniBorrowFormController() {
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
  } = useOmniProductContext('borrow')

  return (
    <OmniFormView
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
            // TODO this should be in metadata man
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
                ]
              : []),
          ],
        },
      })}
    >
      {currentStep === 'risk' && <OmniFormContentRisk />}
      {currentStep === 'setup' && <OmniBorrowFormContentDeposit />}
      {currentStep === 'manage' && <OmniBorrowFormContentManage />}
      {currentStep === 'transition' && <OmniBorrowFormContentTransition />}
      {currentStep === 'transaction' && (
        <OmniFormContentTransaction orderInformation={OmniBorrowFormOrder} />
      )}
    </OmniFormView>
  )
}
