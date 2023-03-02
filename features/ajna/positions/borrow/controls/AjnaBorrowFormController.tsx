import { getToken } from 'blockchain/tokensMetadata'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/positions/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
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
      {currentStep === 'transaction' && (
        <AjnaFormContentTransaction orderInformation={AjnaBorrowFormOrder} />
      )}
    </AjnaFormView>
  )
}
