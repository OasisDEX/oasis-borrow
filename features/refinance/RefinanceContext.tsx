import type { RiskRatio } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import type { OmniGeneralContextTx } from 'features/omni-kit/contexts'
import { getOmniTxStatuses, shiftOmniStep } from 'features/omni-kit/contexts'
import { isShortPosition } from 'features/omni-kit/helpers'
import { useRefinanceFormReducto } from 'features/refinance/state'
import { RefinanceSidebarStep } from 'features/refinance/types'
import type { TxDetails } from 'helpers/handleTransaction'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useState } from 'react'
import type { AddressValue, ChainInfo, IPoolId, PositionId } from 'summerfi-sdk-common'
import { TokenAmount } from 'summerfi-sdk-common'

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

export type RefinanceContext = {
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
    environment: { tokenPrices, slippage, address },
    poolData: { collateralTokenSymbol, debtTokenSymbol, poolId, borrowRate, maxLtv },
    position: { collateralAmount, debtAmount, liquidationPrice, positionId, ltv },
    automations,
  } = contextInput
  const chainInfo = poolId.protocol.chainInfo

  const collateralTokenData = TokenAmount.createFrom({
    amount: collateralAmount,
    token: mapTokenToSdkToken(chainInfo, collateralTokenSymbol),
  })
  const debtTokenData = TokenAmount.createFrom({
    amount: debtAmount,
    token: mapTokenToSdkToken(chainInfo, debtTokenSymbol),
  })

  const collateralPrice = tokenPrices[collateralTokenData.token.symbol]
  const debtPrice = tokenPrices[debtTokenData.token.symbol]

  // TODO: validate address
  const parsedAddress = address as AddressValue

  const steps = [
    RefinanceSidebarStep.Option,
    RefinanceSidebarStep.Strategy,
    RefinanceSidebarStep.Dpm,
    RefinanceSidebarStep.Give,
    RefinanceSidebarStep.Changes,
    RefinanceSidebarStep.Transaction,
  ]

  const [currentStep, setCurrentStep] = useState<RefinanceSidebarStep>(steps[0])
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(false)

  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [gasEstimation, setGasEstimation] = useState<GasEstimationContext>()

  const setupStepManager = (): RefinanceSteps => {
    return {
      currentStep,
      steps,
      isExternalStep: [RefinanceSidebarStep.Give, RefinanceSidebarStep.Dpm].includes(currentStep),
      isFlowStateReady,
      isStepWithTransaction: currentStep === RefinanceSidebarStep.Transaction,
      setIsFlowStateReady,
      setStep: (step) => setCurrentStep(step),
      setNextStep: () => shiftOmniStep({ direction: 'next', currentStep, steps, setCurrentStep }),
      setPrevStep: () => shiftOmniStep({ direction: 'prev', currentStep, steps, setCurrentStep }),
    }
  }

  const setupTxManager = (): OmniGeneralContextTx => {
    return {
      ...getOmniTxStatuses(txDetails?.txStatus),
      setTxDetails,
      setSlippageSource: () => null,
      setGasEstimation,
      txDetails,
    }
  }

  const form = useRefinanceFormReducto({})

  const isShort = isShortPosition({ collateralToken: collateralTokenSymbol })

  const ctx: RefinanceContext = React.useMemo(
    () => ({
      environment: {
        collateralPrice,
        debtPrice,
        address: parsedAddress,
        chainInfo,
        slippage,
        isShort,
        gasEstimation,
      },
      position: {
        collateralTokenData,
        debtTokenData,
        liquidationPrice,
        positionId,
        ltv,
      },
      poolData: {
        poolId,
        borrowRate,
        maxLtv,
      },
      automations,
      form,
      steps: setupStepManager(),
      tx: setupTxManager(),
    }),
    [
      collateralPrice,
      debtPrice,
      parsedAddress,
      chainInfo,
      collateralTokenData,
      debtTokenData,
      liquidationPrice,
      positionId,
      poolId,
      slippage,
      form.state,
      gasEstimation,
    ],
  )

  return <refinanceContext.Provider value={ctx}>{children}</refinanceContext.Provider>
}
