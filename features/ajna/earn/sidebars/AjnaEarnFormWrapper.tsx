import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaFormWrapper } from 'features/ajna/controls/AjnaFormWrapper'
import { AjnaEarnFormContent } from 'features/ajna/earn/sidebars/AjnaEarnFormContent'
import React from 'react'

export function AjnaEarnFormWrapper() {
  // TODO: this has to be changed to Earn context, but so far action and payback doesn't match with AjnaFormWrapper that needs to be refactored
  // but it's not a part of this story
  const {
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
  } = useAjnaBorrowContext()
  const {
    environment: { dpmProxy, collateralToken, quoteToken },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps },
  } = useAjnaProductContext()

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
