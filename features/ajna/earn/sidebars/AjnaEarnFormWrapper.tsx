import { getToken } from 'blockchain/tokensMetadata'
import { AjnaFormContent } from 'features/ajna/common/components/AjnaFormContent'
import { AjnaFormContentRisk } from 'features/ajna/common/components/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/common/components/AjnaFormContentTransaction'
import { AjnaFormWrapper } from 'features/ajna/controls/AjnaFormWrapper'
import { useAjnaEarnContext } from 'features/ajna/earn/contexts/AjnaEarnContext'
import { AjnaEarnFormContentDeposit } from 'features/ajna/earn/sidebars/AjnaEarnFormContentDeposit'
import { AjnaEarnFormOrder } from 'features/ajna/earn/sidebars/AjnaEarnFormOrder'
import { useAjnaEarnTxHandler } from 'features/ajna/earn/useAjnaEarnTxHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormWrapper() {
  const { t } = useTranslation()
  const {
    form: {
      state: { action, depositAmount, uiDropdown },
      updateState,
      dispatch,
    },
    position: { resolvedId, isSimulationLoading },
    validation: { isFormValid },
  } = useAjnaEarnContext()
  const txHandler = useAjnaEarnTxHandler()

  return (
    <AjnaFormWrapper
      action={action}
      depositAmount={depositAmount}
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
              label: t('adjust'),
              panel: 'adjust',
              shortLabel: t('adjust'),
              icon: getToken(collateralToken).iconCircle,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'adjust')
              },
            },
            {
              label: t('deposit'),
              panel: 'deposit',
              shortLabel: t('deposit'),
              icon: getToken(quoteToken).iconCircle,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'deposit')
              },
            },
            {
              label: t('withdraw'),
              panel: 'withdraw',
              shortLabel: t('withdraw'),
              icon: getToken(quoteToken).iconCircle,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'withdraw')
              },
            },
          ]}
        >
          {currentStep === 'risk' && <AjnaFormContentRisk />}
          {currentStep === 'setup' && <AjnaEarnFormContentDeposit />}
          {currentStep === 'transaction' && (
            <AjnaFormContentTransaction orderInfo={AjnaEarnFormOrder} />
          )}
        </AjnaFormContent>
      )}
    </AjnaFormWrapper>
  )
}
