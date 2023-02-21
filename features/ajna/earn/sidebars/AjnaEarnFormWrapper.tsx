import { getToken } from 'blockchain/tokensMetadata'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentRisk } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentRisk'
import { AjnaBorrowFormContentTransaction } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentTransaction'
import { AjnaFormContent } from 'features/ajna/common/components/AjnaFormContent'
import { AjnaFormWrapper } from 'features/ajna/controls/AjnaFormWrapper'
import { AjnaEarnFormContentDeposit } from 'features/ajna/earn/sidebars/AjnaEarnFormContentDeposit'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormWrapper() {
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
      {({ txHandler, isAllowanceLoading, currentStep, dpmProxy, collateralToken, quoteToken }) => (
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
          {currentStep === 'risk' && <AjnaBorrowFormContentRisk />}
          {/*{currentStep === 'setup' && <AjnaEarnFormContentDeposit />}*/}
          {/*TODO use conditional rendering once earn context available*/}
          <AjnaEarnFormContentDeposit />
          {currentStep === 'transaction' && <AjnaBorrowFormContentTransaction />}
        </AjnaFormContent>
      )}
    </AjnaFormWrapper>
  )
}
