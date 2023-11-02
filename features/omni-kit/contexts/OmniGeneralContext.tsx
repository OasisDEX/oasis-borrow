import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { NetworkConfig } from 'blockchain/networks'
import type { GasPriceParams } from 'blockchain/prices.types'
import {
  getOmniEditingStep,
  getOmniTxStatuses,
  isOmniExternalStep,
  isOmniStepWithTransaction,
} from 'features/omni-kit/contexts'
import { isShortPosition } from 'features/omni-kit/helpers'
import type {
  OmniProductType,
  OmniSidebarEditingStep,
  OmniSidebarStep,
} from 'features/omni-kit/types'
import type { TxDetails } from 'helpers/handleTransaction'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useMemo, useState } from 'react'

interface OmniGeneralContextProviderProps {
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
  isOpening: boolean
  isOracless: boolean
  isProxyWithManyPositions: boolean
  network: NetworkConfig
  owner: string
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  quoteAddress: string
  quoteBalance: BigNumber
  quoteDigits: number
  quoteIcon: string
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  slippage: BigNumber
  steps: OmniSidebarStep[]
}

type OmniGeneralContextEnvironment = Omit<OmniGeneralContextProviderProps, 'steps'> & {
  isOwner: boolean
  isShort: boolean
  priceFormat: string
}

interface OmniGeneralContextSteps {
  currentStep: OmniSidebarStep
  editingStep: OmniSidebarEditingStep
  isExternalStep: boolean
  isFlowStateReady: boolean
  isStepWithTransaction: boolean
  steps: OmniSidebarStep[]
  txStatus?: TxStatus
  setIsFlowStateReady: Dispatch<SetStateAction<boolean>>
  setStep: (step: OmniSidebarStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface OmniGeneralContextTx {
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  setTxDetails: Dispatch<SetStateAction<TxDetails | undefined>>
  txDetails?: TxDetails
}

interface OmniGeneralContext {
  environment: OmniGeneralContextEnvironment
  steps: OmniGeneralContextSteps
  tx: OmniGeneralContextTx
}

const omniGeneralContext = React.createContext<OmniGeneralContext | undefined>(undefined)

export function useOmniGeneralContext(): OmniGeneralContext {
  const context = useContext(omniGeneralContext)

  if (!context) throw new Error('OmniGeneralContext not available!')
  return context
}

export function OmniGeneralContextProvider({
  children,
  steps,
  ...props
}: PropsWithChildren<OmniGeneralContextProviderProps>) {
  const {
    collateralBalance,
    collateralToken,
    quoteBalance,
    quoteToken,
    owner,
    slippage,
    isOpening,
    isProxyWithManyPositions,
  } = props
  const { walletAddress } = useAccount()
  const [currentStep, setCurrentStep] = useState<OmniSidebarStep>(steps[0])
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(false)
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const isShort = isShortPosition({ collateralToken })

  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (steps[i]) setCurrentStep(steps[i])
    else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }

  const setupStepManager = (): OmniGeneralContextSteps => {
    return {
      currentStep,
      steps,
      editingStep: getOmniEditingStep(isOpening),
      isExternalStep: isOmniExternalStep({ currentStep }),
      isFlowStateReady,
      isStepWithTransaction: isOmniStepWithTransaction({ currentStep }),
      setIsFlowStateReady,
      setStep: (step) => setCurrentStep(step),
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
    }
  }

  const setupTxManager = (): OmniGeneralContextTx => {
    return {
      ...getOmniTxStatuses(txDetails?.txStatus),
      setTxDetails,
      txDetails,
    }
  }

  const context: OmniGeneralContext = useMemo(
    () => ({
      environment: {
        ...props,
        isShort,
        isProxyWithManyPositions,
        priceFormat: isShort
          ? `${quoteToken}/${collateralToken}`
          : `${collateralToken}/${quoteToken}`,
        isOwner: isOpening || owner === walletAddress,
        slippage,
        collateralBalance,
        quoteBalance,
      },
      steps: setupStepManager(),
      tx: setupTxManager(),
    }),
    [
      collateralBalance,
      currentStep,
      isFlowStateReady,
      quoteBalance,
      txDetails,
      walletAddress,
      slippage,
    ],
  )

  return <omniGeneralContext.Provider value={context}>{children}</omniGeneralContext.Provider>
}
