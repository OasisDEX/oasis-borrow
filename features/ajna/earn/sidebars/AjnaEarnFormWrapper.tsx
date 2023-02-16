import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaFormWrapper } from 'features/ajna/controls/AjnaFormWrapper'
import { AjnaEarnFormContent } from 'features/ajna/earn/sidebars/AjnaEarnFormContent'
import React from 'react'

export function AjnaEarnFormWrapper() {
  const {
    environment: { dpmProxy, collateralToken, quoteToken },
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps },
  } = useAjnaBorrowContext()

  return (
    <AjnaFormWrapper
      dpmProxy={dpmProxy}
      collateralToken={collateralToken}
      quoteToken={quoteToken}
      action={action}
      depositAmount={depositAmount}
      paybackAmount={paybackAmount}
      updateState={updateState}
      currentStep={currentStep}
      editingStep={editingStep}
      isExternalStep={isExternalStep}
      setNextStep={setNextStep}
      setStep={setStep}
      steps={steps}
      children={AjnaEarnFormContent}
    />
  )
}
