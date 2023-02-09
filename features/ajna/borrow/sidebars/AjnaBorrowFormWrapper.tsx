import { FlowSidebar } from 'components/FlowSidebar'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
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

  const flowState = useFlowState({
    token: ['open', 'deposit', 'withdraw'].includes(action as string)
      ? collateralToken
      : quoteToken,
    amount: ['open', 'deposit'].includes(action as string)
      ? depositAmount
      : action === 'payback'
      ? paybackAmount
      : zero,
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
        <AjnaBorrowFormContent isAllowanceLoading={flowState.isLoading} />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
