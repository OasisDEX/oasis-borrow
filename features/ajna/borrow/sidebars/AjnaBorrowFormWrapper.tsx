import { getToken } from 'blockchain/tokensMetadata'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentManage } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentManage'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowTxHandler } from 'features/ajna/borrow/useAjnaBorrowTxHandler'
import { AjnaFormContent } from 'features/ajna/common/components/AjnaFormContent'
import { AjnaFormContentRisk } from 'features/ajna/common/components/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/common/components/AjnaFormContentTransaction'
import { AjnaFormWrapper } from 'features/ajna/controls/AjnaFormWrapper'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormWrapper() {
  const { t } = useTranslation()
  const {
    form: {
      state: { action, depositAmount, paybackAmount, uiDropdown },
      updateState,
      dispatch,
    },
    position: { resolvedId, isSimulationLoading },
    validation: { isFormValid },
  } = useAjnaBorrowContext()
  const txHandler = useAjnaBorrowTxHandler()

  return (
    <AjnaFormWrapper
      action={action}
      depositAmount={depositAmount}
      paybackAmount={paybackAmount}
      updateState={updateState}
      uiDropdown={uiDropdown}
      resolvedId={resolvedId}
      isSimulationLoading={isSimulationLoading}
    >
      {({ isAllowanceLoading, currentStep, dpmProxy, collateralToken, quoteToken }) => (
        <AjnaFormContent
          uiDropdown={uiDropdown}
          dpmAddress={dpmProxy}
          isSimulationLoading={isSimulationLoading}
          txHandler={txHandler}
          isAllowanceLoading={isAllowanceLoading}
          isFormValid={isFormValid}
          resolvedId={resolvedId}
          dropdownItems={[
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
                updateState('uiPill', 'deposit')
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
                updateState('uiPill', 'generate')
              },
            },
          ]}
        >
          {currentStep === 'risk' && <AjnaFormContentRisk />}
          {currentStep === 'setup' && <AjnaBorrowFormContentDeposit />}
          {currentStep === 'manage' && <AjnaBorrowFormContentManage />}
          {currentStep === 'transaction' && (
            <AjnaFormContentTransaction orderInfo={AjnaBorrowFormOrder} />
          )}
        </AjnaFormContent>
      )}
    </AjnaFormWrapper>
  )
}
