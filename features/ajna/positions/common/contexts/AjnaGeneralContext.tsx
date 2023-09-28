import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { GasPriceParams } from 'blockchain/prices.types'
import { isProductContextAvailable } from 'components/context/ProductContextProvider'
import type {
  AjnaFlow,
  AjnaProduct,
  AjnaSidebarEditingStep,
  AjnaSidebarStep,
} from 'features/ajna/common/types'
import {
  getAjnaEditingStep,
  isExternalStep,
  isStepWithTransaction,
} from 'features/ajna/positions/common/contexts/ajnaStepManager'
import { getTxStatuses } from 'features/ajna/positions/common/contexts/ajnaTxManager'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
import type { TxDetails } from 'helpers/handleTransaction'
import { useAccount } from 'helpers/useAccount'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useEffect, useState } from 'react'

interface AjnaGeneralContextProviderProps {
  collateralAddress: string
  collateralBalance: BigNumber
  collateralDigits: number
  collateralPrecision: number
  collateralPrice: BigNumber
  collateralToken: string
  collateralIcon: string
  dpmProxy?: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  flow: AjnaFlow
  id?: string
  isOracless: boolean
  owner: string
  product: AjnaProduct
  quoteAddress: string
  quoteBalance: BigNumber
  quoteDigits: number
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  quoteIcon: string
  steps: AjnaSidebarStep[]
  gasPrice: GasPriceParams
  slippage: BigNumber
  isProxyWithManyPositions: boolean
}

type AjnaGeneralContextEnvironment = Omit<AjnaGeneralContextProviderProps, 'steps'> & {
  isOwner: boolean
  isShort: boolean
  priceFormat: string
}

interface AjnaGeneralContextSteps {
  currentStep: AjnaSidebarStep
  editingStep: AjnaSidebarEditingStep
  isExternalStep: boolean
  isFlowStateReady: boolean
  isStepWithTransaction: boolean
  steps: AjnaSidebarStep[]
  txStatus?: TxStatus
  setIsFlowStateReady: Dispatch<SetStateAction<boolean>>
  setStep: (step: AjnaSidebarStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface AjnaGeneralContextTx {
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  setTxDetails: Dispatch<SetStateAction<TxDetails | undefined>>
  txDetails?: TxDetails
}

interface AjnaGeneralContext {
  environment: AjnaGeneralContextEnvironment
  steps: AjnaGeneralContextSteps
  tx: AjnaGeneralContextTx
}

const ajnaGeneralContext = React.createContext<AjnaGeneralContext | undefined>(undefined)

export function useAjnaGeneralContext(): AjnaGeneralContext {
  const context = useContext(ajnaGeneralContext)

  if (!context) throw new Error('AjnaGeneralContext not available!')
  return context
}

export function AjnaGeneralContextProvider({
  children,
  steps,
  ...props
}: PropsWithChildren<AjnaGeneralContextProviderProps>) {
  if (!isProductContextAvailable()) return null

  const {
    flow,
    collateralBalance,
    collateralToken,
    quoteBalance,
    quoteToken,
    owner,
    slippage,
    isProxyWithManyPositions,
  } = props
  const { walletAddress } = useAccount()
  const [currentStep, setCurrentStep] = useState<AjnaSidebarStep>(steps[0])
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(false)
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const isShort = isShortPosition({ collateralToken })

  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (steps[i]) setCurrentStep(steps[i])
    else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }

  const setupStepManager = (): AjnaGeneralContextSteps => {
    return {
      currentStep,
      steps,
      editingStep: getAjnaEditingStep({
        flow,
      }),
      isExternalStep: isExternalStep({ currentStep }),
      isFlowStateReady,
      isStepWithTransaction: isStepWithTransaction({ currentStep }),
      setIsFlowStateReady,
      setStep: (step) => setCurrentStep(step),
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
    }
  }

  const setupTxManager = (): AjnaGeneralContextTx => {
    return {
      ...getTxStatuses(txDetails?.txStatus),
      setTxDetails,
      txDetails,
    }
  }

  const [context, setContext] = useState<AjnaGeneralContext>({
    environment: {
      ...props,
      isShort,
      isProxyWithManyPositions,
      priceFormat: isShort
        ? `${quoteToken}/${collateralToken}`
        : `${collateralToken}/${quoteToken}`,
      isOwner: owner === walletAddress || flow === 'open',
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
        isOwner: owner === walletAddress || flow === 'open',
        collateralBalance,
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
  ])

  return <ajnaGeneralContext.Provider value={context}>{children}</ajnaGeneralContext.Provider>
}
