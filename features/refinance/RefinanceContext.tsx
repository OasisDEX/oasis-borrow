import type { RiskRatio } from '@oasisdex/dma-library'
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
  poolData: {
    poolId: IPoolId
    borrowRate: string
    collateralTokenSymbol: string
    debtTokenSymbol: string
    maxLtv: RiskRatio
  }
  environment: {
    tokenPrices: Record<string, string>
    chainId: number
    slippage: number
    address?: string
  }
  position: {
    positionId: PositionId
    collateralAmount: string
    debtAmount: string
    liquidationPrice: string
    ltv: RiskRatio
  }
}

export type RefinanceContext = {
  environment: {
    collateralPrice: string
    debtPrice: string
    address?: AddressValue
    chainInfo: ChainInfo
    slippage: number
  }
  position: {
    positionId: PositionId
    collateralTokenAmount: TokenAmount
    debtTokenAmount: TokenAmount
    liquidationPrice: string
    ltv: RiskRatio
  }
  poolData: {
    poolId: IPoolId
    borrowRate: string
    collateralTokenSymbol: string
    debtTokenSymbol: string
    maxLtv: RiskRatio
  }
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
    environment: { tokenPrices, chainId, slippage, address },
    poolData: { collateralTokenSymbol, debtTokenSymbol, poolId, borrowRate, maxLtv },
    position: { collateralAmount, debtAmount, liquidationPrice, positionId, ltv },
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
      environment: {
        collateralPrice,
        debtPrice,
        address: parsedAddress,
        chainInfo,
        slippage,
      },
      position: {
        collateralTokenAmount,
        debtTokenAmount,
        liquidationPrice,
        positionId,
        ltv,
      },
      poolData: {
        poolId,
        borrowRate,
        collateralTokenSymbol,
        debtTokenSymbol,
        maxLtv,
      },
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
