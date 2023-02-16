import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { AjnaEditingStep, AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { isExternalStep, isStepWithTransaction } from 'features/ajna/contexts/ajnaStepManager'
import { getTxStatuses } from 'features/ajna/contexts/ajnaTxManager'
import { TxDetails } from 'helpers/handleTransaction'
import { useAccount } from 'helpers/useAccount'
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AjnaProductContextProviderProps {
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  dpmProxy?: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  flow: AjnaFlow
  id?: string
  owner: string
  product: AjnaProduct
  quoteBalance: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  steps: AjnaStatusStep[]
}

type AjnaProductEnvironment = Omit<AjnaProductContextProviderProps, 'steps'>

interface AjnaProductFlowSteps {
  currentStep: AjnaStatusStep
  editingStep: AjnaEditingStep
  isExternalStep: boolean
  isStepWithTransaction: boolean
  steps: AjnaStatusStep[]
  txStatus?: TxStatus
  setStep: (step: AjnaStatusStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface AjnaProductTx {
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  setTxDetails: Dispatch<SetStateAction<TxDetails | undefined>>
  txDetails?: TxDetails
}

interface AjnaProductContext {
  environment: AjnaProductEnvironment & {
    isOwner: boolean
  }
  steps: AjnaProductFlowSteps
  tx: AjnaProductTx
}

const ajnaProductContext = React.createContext<AjnaProductContext | undefined>(undefined)

export function useAjnaProductContext(): AjnaProductContext {
  const ac = useContext(ajnaProductContext)

  if (!ac) {
    throw new Error(
      "AjnaProductContext not available! useAjnaProductContext can't be used serverside",
    )
  }
  return ac
}

export function AjnaProductContextProvider({
  children,
  steps,
  ...props
}: PropsWithChildren<AjnaProductContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const { flow, collateralBalance, quoteBalance, owner } = props
  const { walletAddress } = useAccount()
  const [currentStep, setCurrentStep] = useState<AjnaStatusStep>(steps[0])
  const [txDetails, setTxDetails] = useState<TxDetails>()

  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (steps[i]) setCurrentStep(steps[i])
    else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }

  const setupStepManager = (): AjnaProductFlowSteps => {
    return {
      currentStep,
      steps,
      editingStep: flow === 'open' ? 'setup' : 'manage',
      isExternalStep: isExternalStep({ currentStep }),
      isStepWithTransaction: isStepWithTransaction({ currentStep }),
      setStep: (step) => setCurrentStep(step),
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
    }
  }

  const setupTxManager = (): AjnaProductTx => {
    return {
      ...getTxStatuses(txDetails?.txStatus),
      setTxDetails,
      txDetails,
    }
  }

  const [context, setContext] = useState<AjnaProductContext>({
    environment: { ...props, isOwner: owner === walletAddress || flow === 'open' },
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
      },
      steps: setupStepManager(),
      tx: setupTxManager(),
    }))
  }, [collateralBalance, currentStep, quoteBalance, txDetails, walletAddress])

  return <ajnaProductContext.Provider value={context}>{children}</ajnaProductContext.Provider>
}
