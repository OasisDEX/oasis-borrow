import type { TxStatus } from '@oasisdex/transactions'
import { shiftOmniStep } from 'features/omni-kit/contexts'
import { useRefinanceFormReducto } from 'features/refinance/state'
import { RefinanceSidebarStep } from 'features/refinance/types'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useState } from 'react'
import type { AddressValue, ChainInfo, IPoolId, PositionId } from 'summerfi-sdk-common'
import { getChainInfoByChainId, TokenAmount } from 'summerfi-sdk-common'

import { mapTokenToSdkToken } from './mapTokenToSdkToken'

interface RefinanceSteps {
  currentStep: RefinanceSidebarStep
  isExternalStep: boolean
  isFlowStateReady: boolean
  isStepWithTransaction: boolean
  steps: RefinanceSidebarStep[]
  txStatus?: TxStatus
  setIsFlowStateReady: Dispatch<SetStateAction<boolean>>
  setStep: (step: RefinanceSidebarStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

export type RefinanceContextInput = {
  positionId: PositionId
  poolId: IPoolId
  collateralTokenSymbol: string
  debtTokenSymbol: string
  collateralAmount: string
  debtAmount: string
  chainId: number
  slippage: number
  tokenPrices: Record<string, string>
  address?: string
  liquidationPrice: string
}

export type RefinanceContext = {
  positionId: PositionId
  poolId: IPoolId
  collateralTokenAmount: TokenAmount
  debtTokenAmount: TokenAmount
  collateralPrice: string
  debtPrice: string
  chainInfo: ChainInfo
  slippage: number
  address?: AddressValue
  liquidationPrice: string
  form: ReturnType<typeof useRefinanceFormReducto>
  steps: RefinanceSteps
}

export const refinanceContext = React.createContext<RefinanceContext | undefined>(undefined)

export const useRefinanceContext = () => {
  const context = useContext(refinanceContext)

  if (!context) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }
  return context
}

interface RefinanceContextProviderProps {
  contextInput: RefinanceContextInput
}

export function RefinanceContextProvider({
  children,
  contextInput,
}: PropsWithChildren<RefinanceContextProviderProps>) {
  const {
    chainId,
    collateralTokenSymbol,
    debtTokenSymbol,
    collateralAmount,
    debtAmount,
    address,
    tokenPrices,
    liquidationPrice,
    positionId,
    poolId,
    slippage,
  } = contextInput
  const chainInfo = getChainInfoByChainId(chainId)
  if (!chainInfo) {
    throw new Error(`ChainId ${chainId} is not supported`)
  }

  const collateralTokenAmount = TokenAmount.createFrom({
    amount: collateralAmount,
    token: mapTokenToSdkToken(chainInfo, collateralTokenSymbol),
  })
  const debtTokenAmount = TokenAmount.createFrom({
    amount: debtAmount,
    token: mapTokenToSdkToken(chainInfo, debtTokenSymbol),
  })

  const collateralPrice = tokenPrices[collateralTokenAmount.token.symbol]
  const debtPrice = tokenPrices[debtTokenAmount.token.symbol]

  // TODO: validate address
  const parsedAddress = address as AddressValue

  const steps = [
    RefinanceSidebarStep.Option,
    RefinanceSidebarStep.Strategy,
    RefinanceSidebarStep.Dpm,
    RefinanceSidebarStep.Changes,
    RefinanceSidebarStep.Transaction,
  ]

  const [currentStep, setCurrentStep] = useState<RefinanceSidebarStep>(steps[0])
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(false)

  const setupStepManager = (): RefinanceSteps => {
    return {
      currentStep,
      steps,
      isExternalStep: currentStep === RefinanceSidebarStep.Dpm,
      isFlowStateReady,
      isStepWithTransaction: currentStep === RefinanceSidebarStep.Transaction,
      setIsFlowStateReady,
      setStep: (step) => setCurrentStep(step),
      setNextStep: () => shiftOmniStep({ direction: 'next', currentStep, steps, setCurrentStep }),
      setPrevStep: () => shiftOmniStep({ direction: 'prev', currentStep, steps, setCurrentStep }),
    }
  }

  const form = useRefinanceFormReducto({})

  const ctx: RefinanceContext = React.useMemo(
    () => ({
      collateralPrice,
      debtPrice,
      address: parsedAddress,
      chainInfo,
      collateralTokenAmount,
      debtTokenAmount,
      liquidationPrice,
      positionId,
      poolId,
      slippage,
      form,
      steps: setupStepManager(),
    }),
    [
      collateralPrice,
      debtPrice,
      parsedAddress,
      chainInfo,
      collateralTokenAmount,
      debtTokenAmount,
      liquidationPrice,
      positionId,
      poolId,
      slippage,
      form.state,
    ],
  )

  return <refinanceContext.Provider value={ctx}>{children}</refinanceContext.Provider>
}
