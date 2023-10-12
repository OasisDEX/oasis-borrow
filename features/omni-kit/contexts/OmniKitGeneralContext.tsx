import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { GasPriceParams } from 'blockchain/prices.types'
import {
  getEditingStep,
  isExternalStep,
  isStepWithTransaction,
} from 'features/omni-kit/contexts/omniKitStepManagerHelpers'
import { getTxStatuses } from 'features/omni-kit/contexts/omniKitTxManager'
import type {
  OmniKitEditingStep,
  OmniKitProductType,
  OmniKitSidebarStep,
} from 'features/omni-kit/types'
import type { TxDetails } from 'helpers/handleTransaction'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useEffect, useState } from 'react'

interface OmniKitGeneralContextProviderProps {
  collateralAddress: string
  collateralBalance: BigNumber
  collateralDigits: number
  collateralIcon: string
  collateralPrecision: number
  collateralPrice: BigNumber
  collateralToken: string
  dpmProxy?: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasPrice: GasPriceParams
  isOracless: boolean
  isProxyWithManyPositions: boolean
  isShort: boolean
  network: NetworkNames
  owner: string
  positionId?: string
  productType: OmniKitProductType
  protocol: LendingProtocol
  quoteAddress: string
  quoteBalance: BigNumber
  quoteDigits: number
  quoteIcon: string
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  slippage: BigNumber
  steps: OmniKitSidebarStep[]
}

type OmniKitGeneralContextEnvironment = Omit<OmniKitGeneralContextProviderProps, 'steps'> & {
  isOwner: boolean
  priceFormat: string
}

interface OmniKitGeneralContextSteps {
  currentStep: OmniKitSidebarStep
  editingStep: OmniKitEditingStep
  isExternalStep: boolean
  isFlowStateReady: boolean
  isStepWithTransaction: boolean
  setIsFlowStateReady: Dispatch<SetStateAction<boolean>>
  setNextStep: () => void
  setPrevStep: () => void
  setStep: (step: OmniKitSidebarStep) => void
  steps: OmniKitSidebarStep[]
  txStatus?: TxStatus
}

interface OmniKitGeneralContextTx {
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  setTxDetails: Dispatch<SetStateAction<TxDetails | undefined>>
  txDetails?: TxDetails
}

interface OmniKitGeneralContext {
  environment: OmniKitGeneralContextEnvironment
  steps: OmniKitGeneralContextSteps
  tx: OmniKitGeneralContextTx
}

const omniKitGeneralContext = React.createContext<OmniKitGeneralContext | undefined>(undefined)

export function useOmniKitGeneralContext(): OmniKitGeneralContext {
  const context = useContext(omniKitGeneralContext)

  if (!context) throw new Error('OmniKitGeneralContext not available!')
  else return context
}

export function OmniKitGeneralContextProvider({
  children,
  steps,
  ...props
}: PropsWithChildren<OmniKitGeneralContextProviderProps>) {
  const {
    collateralBalance,
    collateralToken,
    isShort,
    owner,
    positionId,
    quoteBalance,
    quoteToken,
    slippage,
  } = props

  const { walletAddress } = useAccount()

  const [currentStep, setCurrentStep] = useState<OmniKitSidebarStep>(steps[0])
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(false)
  const [txDetails, setTxDetails] = useState<TxDetails>()

  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (steps[i]) setCurrentStep(steps[i])
    else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }

  const setupStepManager = (): OmniKitGeneralContextSteps => {
    return {
      currentStep,
      editingStep: getEditingStep({ steps }),
      isExternalStep: isExternalStep({ currentStep }),
      isFlowStateReady,
      isStepWithTransaction: isStepWithTransaction({ currentStep }),
      setIsFlowStateReady,
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
      setStep: (step) => setCurrentStep(step),
      steps,
    }
  }

  const setupTxManager = (): OmniKitGeneralContextTx => {
    return {
      ...getTxStatuses(txDetails?.txStatus),
      setTxDetails,
      txDetails,
    }
  }

  const [context, setContext] = useState<OmniKitGeneralContext>({
    environment: {
      ...props,
      isOwner: owner === walletAddress || positionId === undefined,
      priceFormat: isShort
        ? `${quoteToken}/${collateralToken}`
        : `${collateralToken}/${quoteToken}`,
      slippage,
    },
    steps: setupStepManager(),
    tx: setupTxManager(),
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      environment: {
        ...prev.environment,
        collateralBalance,
        isOwner: owner === walletAddress || positionId === undefined,
        quoteBalance,
        slippage,
      },
      steps: setupStepManager(),
      tx: setupTxManager(),
    }))
  }, [
    collateralBalance,
    currentStep,
    isFlowStateReady,
    quoteBalance,
    txDetails,
    walletAddress,
    slippage,
    owner,
  ])

  return <omniKitGeneralContext.Provider value={context}>{children}</omniKitGeneralContext.Provider>
}
