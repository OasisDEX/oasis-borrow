import { FlowSidebar } from 'components/FlowSidebar'
import { ethers } from 'ethers'
import { getAjnaBorrowStatus } from 'features/ajna/borrow/helpers'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaTxHandler } from 'features/ajna/borrow/useAjnaTxHandler'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'

export function AjnaBorrowFormWrapper() {
  const { walletAddress } = useAccount()
  const {
    environment: { dpmProxy, collateralToken, quoteToken, isOwner },
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps, isStepValid },
    tx: { isTxInProgress, isTxWaitingForApproval, isTxError, isTxStarted },
    position: { isSimulationLoading },
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

  const {
    isPrimaryButtonLoading,
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isTextButtonHidden,
  } = getAjnaBorrowStatus({
    walletAddress,
    isStepValid,
    isAllowanceLoading: flowState.isLoading,
    isSimulationLoading,
    isTxInProgress,
    isTxWaitingForApproval,
    isTxError,
    isTxStarted,
    currentStep,
    editingStep,
    isOwner,
  })

  return (
    <>
      {!isExternalStep ? (
        <AjnaBorrowFormContent
          txHandler={txHandler}
          isPrimaryButtonLoading={isPrimaryButtonLoading}
          isPrimaryButtonDisabled={isPrimaryButtonDisabled}
          isPrimaryButtonHidden={isPrimaryButtonHidden}
          isTextButtonHidden={isTextButtonHidden}
        />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
