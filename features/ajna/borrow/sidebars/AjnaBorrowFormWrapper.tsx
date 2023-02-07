import { FlowSidebar } from 'components/FlowSidebar'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaTxHandler } from 'features/ajna/borrow/useAjnaTxHandler'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import React, { useEffect } from 'react'

export function AjnaBorrowFormWrapper() {
  const { walletAddress } = useAccount()
  const {
    environment: { collateralToken, quoteToken },
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps },
  } = useAjnaBorrowContext()
  const txHandler = useAjnaTxHandler()

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
  useEffect(() => {
    if (!walletAddress && steps.indexOf(currentStep) > steps.indexOf(editingStep))
      setStep(editingStep)
  }, [walletAddress])

  return (
    <>
      {!isExternalStep ? (
        <AjnaBorrowFormContent isAllowanceLoading={flowState.isLoading} txHandler={txHandler} />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
