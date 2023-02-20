import { getToken } from 'blockchain/tokensMetadata'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormContentRisk } from 'features/ajna/common/sidebars/AjnaBorrowFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/common/sidebars/AjnaBorrowFormContentTransaction'
import { AjnaFormView } from 'features/ajna/common/views/AjnaFormView'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, flow, quoteToken },
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
              icon: getToken(collateralToken).iconCircle,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'collateral')
                updateState('uiPill', 'deposit-borrow')
              },
            },
            {
              label: t('system.manage-debt-token', {
                token: quoteToken,
              }),
              panel: 'quote',
              shortLabel: quoteToken,
              icon: getToken(quoteToken).iconCircle,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'quote')
                updateState('uiPill', 'generate-borrow')
              },
            },
          ],
        },
      })}
    >
      {currentStep === 'risk' && <AjnaFormContentRisk />}
      {currentStep === 'setup' && <AjnaBorrowFormContentDeposit />}
      {currentStep === 'manage' && <AjnaBorrowFormContentManage />}
      {currentStep === 'transaction' && <AjnaFormContentTransaction />}
    </AjnaFormView>
  )
}
