import type { RiskRatio } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { OmniGeneralContextTx } from 'features/omni-kit/contexts'
import type { InitializeRefinanceContextData } from 'features/refinance/helpers'
import { initializeRefinanceContext } from 'features/refinance/helpers'
import type { useRefinanceFormReducto } from 'features/refinance/state'
import type { RefinanceSidebarStep } from 'features/refinance/types'
import { dummyCtxInput } from 'pages/portfolio/[address]'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useState } from 'react'
import type { AddressValue, ChainInfo, IPoolId, PositionId, TokenAmount } from 'summerfi-sdk-common'

export interface RefinanceSteps {
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

type IsAutomationEnabled = {
  enabled: boolean
}

export type RefinanceContextInputAutomations = {
  stopLoss?: IsAutomationEnabled
  trailingStopLoss?: IsAutomationEnabled
  autoSell?: IsAutomationEnabled
  autoBuy?: IsAutomationEnabled
  partialTakeProfit?: IsAutomationEnabled
  autoTakeProfit?: IsAutomationEnabled
  constantMultiple?: IsAutomationEnabled
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
  automations: RefinanceContextInputAutomations
}

export type RefinanceContextBase = {
  environment: {
    collateralPrice: string
    debtPrice: string
    address?: AddressValue
    chainInfo: ChainInfo
    slippage: number
    isShort: boolean
    gasEstimation: GasEstimationContext | undefined
  }
  position: {
    positionId: PositionId
    collateralTokenData: TokenAmount
    debtTokenData: TokenAmount
    liquidationPrice: string
    ltv: RiskRatio
  }
  poolData: {
    poolId: IPoolId
    borrowRate: string
    maxLtv: RiskRatio
  }
  automations: RefinanceContextInputAutomations
  form: ReturnType<typeof useRefinanceFormReducto>
  steps: RefinanceSteps
  tx: OmniGeneralContextTx
}

type RefinanceContexts = Record<string, RefinanceContextBase>

type RefinanceInitializationCall = () => (
  ctxDefault?: RefinanceContextBase,
) => InitializeRefinanceContextData

export type RefinanceContext = RefinanceContextBase & {
  handleSetContext: (id: string, ctx: RefinanceInitializationCall) => void
  handleOnClose: (id: string) => void
  contexts: RefinanceContexts
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
  contextInput?: RefinanceContextInput
}

export function RefinanceContextProvider({
  children,
  contextInput = dummyCtxInput,
}: PropsWithChildren<RefinanceContextProviderProps>) {
  const [contexts, setContexts] = useState<RefinanceContexts>({
    init: initializeRefinanceContext({ contextInput }).ctx,
  })
  const [currentContext, setCurrentContext] = useState<string>('init')
  const [initializator, setInitializator] = useState(
    () => (def: RefinanceContextBase) =>
      initializeRefinanceContext({ contextInput, defaultCtx: def }),
  )

  const { ctx, reset } = initializator(contexts[currentContext])

  const handleSetContext = (id: string, init: RefinanceInitializationCall) => {
    setInitializator(init)
    setCurrentContext(id)
    reset(contexts[id])
  }

  const handleOnClose = (id: string) => {
    setContexts((prev) => ({ ...prev, [id]: ctx }))
  }

  return (
    <refinanceContext.Provider
      value={{
        ...ctx,
        handleSetContext,
        handleOnClose,
        contexts,
      }}
    >
      {children}
    </refinanceContext.Provider>
  )
}
