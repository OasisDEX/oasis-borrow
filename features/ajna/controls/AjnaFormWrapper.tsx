import BigNumber from 'bignumber.js'
import { FlowSidebar } from 'components/FlowSidebar'
import { ethers } from 'ethers'
import { AjnaBorrowAction, AjnaEarnAction, AjnaStatusStep } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import React, { ReactNode, useEffect } from 'react'

interface AjnaFormWrapperProps {
  action?: AjnaBorrowAction | AjnaEarnAction
  depositAmount?: BigNumber
  paybackAmount?: BigNumber
  updateState: (key: 'dpmAddress', value: string) => void
  children: ({
    isAllowanceLoading,
    currentStep,
    dpmProxy,
    collateralToken,
    quoteToken,
  }: {
    isAllowanceLoading: boolean
    currentStep: AjnaStatusStep
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
  const {
    environment: { dpmProxy, collateralToken, quoteToken },
    steps: { currentStep, editingStep, isExternalStep, setNextStep, setStep, steps },
  } = useAjnaProductContext()

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
