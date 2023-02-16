import BigNumber from 'bignumber.js'
import { FlowSidebar } from 'components/FlowSidebar'
import { ethers } from 'ethers'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { useAjnaTxHandler } from 'features/ajna/borrow/useAjnaTxHandler'
import { AjnaBorrowAction, AjnaEditingStep, AjnaStatusStep } from 'features/ajna/common/types'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'

// TODO should accept earn teams as well
interface AjnaFormWrapperProps {
  dpmProxy?: string
  collateralToken: string
  quoteToken: string
  action?: AjnaBorrowAction
  depositAmount?: BigNumber
  paybackAmount?: BigNumber
  updateState: <K extends keyof AjnaBorrowFormState, V extends AjnaBorrowFormState[K]>(
    key: K,
    value: V,
  ) => void
  currentStep: string
  editingStep: AjnaEditingStep
  isExternalStep: boolean
  setNextStep: () => void
  setStep: (step: AjnaStatusStep) => void
  steps: string[]
  children: (props: { txHandler: () => void; isAllowanceLoading: boolean }) => JSX.Element
}

export function AjnaFormWrapper({
  dpmProxy,
  collateralToken,
  quoteToken,
  action,
  depositAmount,
  paybackAmount,
  updateState,
  currentStep,
  editingStep,
  isExternalStep,
  setNextStep,
  setStep,
  steps,
  children: Children,
}: AjnaFormWrapperProps) {
  const { walletAddress } = useAccount()
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
        <Children txHandler={txHandler} isAllowanceLoading={flowState.isLoading} />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
