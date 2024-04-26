import type { RiskRatio } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { OmniGeneralContextTx } from 'features/omni-kit/contexts'
import type { OmniFiltersParameters, OmniValidations } from 'features/omni-kit/types'
import type { RefinanceInterestRatesMetadata } from 'features/refinance/helpers'
import { useInitializeRefinanceContext } from 'features/refinance/hooks'
import type { useRefinanceFormReducto } from 'features/refinance/state'
import type { RefinanceSidebarStep } from 'features/refinance/types'
import type { LendingProtocol } from 'lendingProtocols'
import type { Dispatch, FC, SetStateAction } from 'react'
import React, { useContext, useState } from 'react'
import type {
  AddressValue,
  ChainInfo,
  IPoolId,
  PositionId,
  PositionType,
  TokenAmount,
} from 'summerfi-sdk-common'

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
    pairId: number
  }
  environment: {
    chainId: number
    slippage: number
    address?: string
    isOwner: boolean
  }
  position: {
    positionId: PositionId
    collateralAmount: string
    debtAmount: string
    liquidationPrice: string
    ltv: RiskRatio
    positionType: PositionType
    lendingProtocol: LendingProtocol
    protocolPrices: Record<string, string>
  }
  automations: RefinanceContextInputAutomations
  contextId: string
}

export type RefinanceGeneralContextBase = {
  environment: {
    contextId: string
    address?: AddressValue
    chainInfo: ChainInfo
    slippage: number
    gasEstimation: GasEstimationContext | undefined
    isOwner: boolean
  }
  position: {
    positionId: PositionId
    collateralTokenData: TokenAmount
    debtTokenData: TokenAmount
    liquidationPrice: string
    ltv: RiskRatio
    positionType: PositionType
    isShort: boolean
    lendingProtocol: LendingProtocol
    protocolPrices: {
      collateralPrice: string
      debtPrice: string
      ethPrice: string
    }
  }
  poolData: {
    poolId: IPoolId
    borrowRate: string
    maxLtv: RiskRatio
    pairId: number
  }
  metadata: {
    flowStateFilter: (params: OmniFiltersParameters) => Promise<boolean>
    validations: OmniValidations
    safetySwitch: boolean
    suppressValidation: boolean
  }
  automations: RefinanceContextInputAutomations
  form: ReturnType<typeof useRefinanceFormReducto>
  steps: RefinanceSteps
  tx: OmniGeneralContextTx
}

interface RefinanceGeneralContextCache {
  handlePositionOwner: (owner?: string) => void
  positionOwner?: string
  handleInterestRates: (interestRates?: RefinanceInterestRatesMetadata) => void
  interestRatesMetadata?: RefinanceInterestRatesMetadata
}

type RefinanceContexts = Record<string, RefinanceGeneralContextBase>

export type RefinanceGeneralContext = {
  ctx?: RefinanceGeneralContextBase
  cache: RefinanceGeneralContextCache
  handleSetContext: (ctx: RefinanceContextInput) => void
  handleOnClose: (id: string) => void
}

export const refinanceGeneralContext = React.createContext<RefinanceGeneralContext | undefined>(
  undefined,
)

export const useRefinanceGeneralContext = () => {
  const context = useContext(refinanceGeneralContext)

  if (!context) {
    throw new Error('RefinanceGeneralContextProvider is missing in the hierarchy')
  }
  return context
}

export const RefinanceGeneralContextProvider: FC = ({ children }) => {
  const [contexts, setContexts] = useState<RefinanceContexts>({})
  const [currentContext, setCurrentContext] = useState<string>('')
  const [contextInput, setContextInput] = useState<RefinanceContextInput | undefined>(undefined)

  // cache
  const [positionOwner, setPositionOwner] = useState<string>()
  const [interestRatesMetadata, setInterestRatesMetadata] =
    useState<RefinanceInterestRatesMetadata>()

  const { ctx, reset } = useInitializeRefinanceContext({
    contextInput: contextInput,
    defaultCtx: contexts[currentContext],
  })

  const handleSetContext = (init: RefinanceContextInput) => {
    // Reset cache
    if (currentContext !== init.contextId) {
      setPositionOwner(undefined)
    }

    // Load context
    setContextInput(init)
    setCurrentContext(init.contextId)
    reset(contexts[init.contextId])
  }

  const handleOnClose = (id: string) => {
    if (ctx) {
      setContexts((prev) => ({ ...prev, [id]: ctx }))
    }
  }

  const handlePositionOwner = (owner?: string) => {
    setPositionOwner(owner?.toLowerCase())
  }

  const handleInterestRates = (interestRates?: RefinanceInterestRatesMetadata) => {
    setInterestRatesMetadata(interestRates)
  }

  return (
    <refinanceGeneralContext.Provider
      value={{
        ctx,
        cache: {
          handlePositionOwner,
          positionOwner,
          handleInterestRates,
          interestRatesMetadata,
        },
        handleSetContext,
        handleOnClose,
      }}
    >
      {children}
    </refinanceGeneralContext.Provider>
  )
}
