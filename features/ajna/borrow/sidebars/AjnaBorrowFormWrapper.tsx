import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormWrapper() {
  const {
    steps: { currentStep, isExternalStep },
  } = useAjnaBorrowContext()

  return (
    <>
      {!isExternalStep ? (
        <AjnaBorrowFormContent />
      ) : (
        <>
          {currentStep === 'proxy' && 'DPM external component'}
          {currentStep === 'allowance-collateral' && 'Allowance for collateral external component'}
          {currentStep === 'allowance-quote' && 'Allowance for quote external component'}
        </>
      )}
    </>
  )
}
