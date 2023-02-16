import { FlowSidebar } from 'components/FlowSidebar'
import { ethers } from 'ethers'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaTxHandler } from 'features/ajna/borrow/useAjnaTxHandler'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'

export function AjnaBorrowFormWrapper() {
  const { walletAddress } = useAccount()
  const {
    environment: { dpmProxy, collateralToken, quoteToken },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps },
  } = useAjnaProductContext()
  const {
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
  } = useAjnaBorrowContext()

  const txHandler = useAjnaTxHandler()

  const flowState = useFlowState({
    ...(dpmProxy && { existingProxy: dpmProxy }),
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
    updateState(
      'dpmAddress',
      flowState.availableProxies.length
        ? flowState.availableProxies[0]
        : ethers.constants.AddressZero,
    )
  }, [flowState.availableProxies])
  useEffect(() => {
    if (!walletAddress && steps.indexOf(currentStep) > steps.indexOf(editingStep))
      setStep(editingStep)
  }, [walletAddress])

  return (
    <>
      {!isExternalStep ? (
        <AjnaBorrowFormContent txHandler={txHandler} isAllowanceLoading={flowState.isLoading} />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
