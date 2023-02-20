import BigNumber from 'bignumber.js'
import { FlowSidebar } from 'components/FlowSidebar'
import { ethers } from 'ethers'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { useAjnaTxHandler } from 'features/ajna/borrow/useAjnaTxHandler'
import { AjnaBorrowAction, AjnaSidebarStep } from 'features/ajna/common/types'
import { useAjnaGeneralContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React, { ReactNode, useEffect } from 'react'

// TODO should accept earn teams as well
interface AjnaFormWrapperProps {
  action?: AjnaBorrowAction
  depositAmount?: BigNumber
  paybackAmount?: BigNumber
  updateState: <K extends keyof AjnaBorrowFormState, V extends AjnaBorrowFormState[K]>(
    key: K,
    value: V,
  ) => void
  children: ({
    txHandler,
    isAllowanceLoading,
    currentStep,
    dpmProxy,
    collateralToken,
    quoteToken,
  }: {
    txHandler: () => void
    isAllowanceLoading: boolean
    currentStep: AjnaSidebarStep
    dpmProxy?: string
    collateralToken: string
    quoteToken: string
  }) => ReactNode
  uiDropdown: any
  resolvedId?: string
  isSimulationLoading?: boolean
}

export function AjnaFormWrapper({
  action,
  depositAmount,
  paybackAmount,
  updateState,
  children,
}: AjnaFormWrapperProps) {
  const { walletAddress } = useAccount()
  const txHandler = useAjnaTxHandler()
  const {
    environment: { dpmProxy, collateralToken, quoteToken },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps },
  } = useAjnaGeneralContext()

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
        children({
          txHandler,
          isAllowanceLoading: flowState.isLoading,
          currentStep,
          dpmProxy,
          collateralToken,
          quoteToken,
        })
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
