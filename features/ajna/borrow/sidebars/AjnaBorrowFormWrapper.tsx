import { FlowSidebar } from 'components/FlowSidebar'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useFlowState } from 'helpers/useFlowState'
import React, { useEffect } from 'react'

export function AjnaBorrowFormWrapper() {
  const {
    environment: { collateralToken, quoteToken },
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep },
  } = useAjnaBorrowContext()

  const flowState = useFlowState({
    ...((action === 'open' || action === 'deposit') && {
      amount: depositAmount,
      token: collateralToken,
    }),
    ...(action === 'payback' && {
      amount: paybackAmount,
      token: quoteToken,
    }),
    onEverythingReady: () => setNextStep(),
    onGoBack: () => setStep(editingStep),
  })

  useEffect(() => {
    if (flowState.availableProxies.length) updateState('dpmAddress', flowState.availableProxies[0])
  }, [flowState.availableProxies])

  return (
    <>
      {!isExternalStep ? (
        <AjnaBorrowFormContent isAllowanceLoading={flowState.isLoading} />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
