import type { RiskRatio } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type {
  AddressValue,
  ChainInfo,
  IPoolId,
  ITokenAmount,
  PositionId,
  PositionType,
} from '@summer_fi/summerfi-sdk-common'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { OmniGeneralContextTx } from 'features/omni-kit/contexts'
import type { OmniValidations } from 'features/omni-kit/types'
import type { RefinanceInterestRatesMetadata } from 'features/refinance/helpers'
import { useInitializeRefinanceContextBase } from 'features/refinance/hooks'
import type { useRefinanceFormReducto } from 'features/refinance/state'
import type { DpmRefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'
import type { RefinanceSidebarStep } from 'features/refinance/types'
import type { LendingProtocol } from 'lendingProtocols'
import type { Dispatch, FC, SetStateAction } from 'react'
import React, { useContext, useState } from 'react'

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
    borrowRate: string
    supplyRate: string
    protocolPrices: Record<string, string>
    owner?: string
    // dpm should be passed as parameter only for positions (protocols) that already uses DPM for position creation
    // so in general only in the scope of Maker we shouldn't pass here dpm
    dpm?: DpmRefinanceFormState
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
    getTokenUsdPrice: (symbol: string) => string
  }
  position: {
    positionId: PositionId
    collateralTokenData: ITokenAmount
    debtTokenData: ITokenAmount
    liquidationPrice: string
    ltv: RiskRatio
    positionType: PositionType
    isShort: boolean
    lendingProtocol: LendingProtocol
    borrowRate: string
    supplyRate: string
    protocolPrices: {
      collateralPrice: string
      debtPrice: string
      ethPrice: string
    }
  }
  poolData: {
    poolId: IPoolId
    maxLtv: RiskRatio
    pairId: number
  }
  metadata: {
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
  setPositionOwner: (owner?: string) => void
  positionOwner?: string
  setInterestRates: (interestRates?: RefinanceInterestRatesMetadata) => void
  interestRates?: RefinanceInterestRatesMetadata
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

  const { ctx, reset } = useInitializeRefinanceContextBase({
    contextInput: contextInput,
    defaultCtx: contexts[currentContext],
  })

  const handleSetContext = (init: RefinanceContextInput) => {
    // Reset cache
    if (currentContext !== init.contextId) {
      setPositionOwner(undefined)
      setInterestRatesMetadata(undefined)
    }

    // Load context
    setContextInput(init)
    setCurrentContext(init.contextId)
    // reset is being triggered on each modal open window
    // therefore we define defaults here instead of using reducto
    // default state handling
    reset(contexts[init.contextId], init.position.dpm)
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
          setPositionOwner: handlePositionOwner,
          positionOwner,
          setInterestRates: handleInterestRates,
          interestRates: interestRatesMetadata,
        },
        handleSetContext,
        handleOnClose,
      }}
    >
      {children}
    </refinanceGeneralContext.Provider>
  )
}
