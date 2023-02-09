import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { isBorrowStepValid } from 'features/ajna/borrow/contexts/ajnaBorrowStepManager'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import {
  isExternalStep,
  isNextStep,
  isStepWithTransaction,
} from 'features/ajna/contexts/ajnaStepManager'
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

interface AjnaBorrowContextProviderProps {
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  dpmProxy?: string
  ethPrice: BigNumber
  flow: AjnaFlow
  product: AjnaProduct
  quoteBalance: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  owner: string
  position: AjnaBorrowPosition
  steps: AjnaStatusStep[]
}

type AjnaBorrowEnvironment = Omit<AjnaBorrowContextProviderProps, 'position' | 'steps'>

// temporary, interface will come from MPA
export interface AjnaBorrowPosition {
  id?: string
}

interface AjnaBorrowSteps {
  currentStep: AjnaStatusStep
  editingStep: Extract<AjnaStatusStep, 'setup' | 'manage'>
  isExternalStep: boolean
  isStepValid: boolean
  isStepWithTransaction: boolean
  steps: AjnaStatusStep[]
  txStatus?: TxStatus
  setStep: (step: AjnaStatusStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface AjnaBorrowTx {
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  txDetails?: TxDetails
  setTxDetails: Dispatch<SetStateAction<TxDetails | undefined>>
  setSimulationData: Dispatch<SetStateAction<AjnaBorrowPosition | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  simulation?: {
    isLoading: boolean
    data?: AjnaBorrowPosition
  }
}

interface AjnaBorrowContext {
  environment: AjnaBorrowEnvironment & {
    isOwner: boolean
  }
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaBorrowPosition
  steps: AjnaBorrowSteps
  tx: AjnaBorrowTx
}

const ajnaBorrowContext = React.createContext<AjnaBorrowContext | undefined>(undefined)

export function useAjnaBorrowContext(): AjnaBorrowContext {
  const ac = useContext(ajnaBorrowContext)

  if (!ac) {
    throw new Error(
      "AjnaBorrowContext not available! useAjnaBorrowContext can't be used serverside",
    )
  }
  return ac
}

export function AjnaBorrowContextProvider({
  children,
  position,
  steps,
  ...props
}: PropsWithChildren<AjnaBorrowContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const form = useAjnaBorrowFormReducto({})
  const { walletAddress } = useAccount()
  const [currentStep, setCurrentStep] = useState<AjnaStatusStep>(steps[0])
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [simulationData, setSimulationData] = useState<AjnaBorrowPosition>()
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false)

  const setStep = (step: AjnaStatusStep) => {
    if (
      !isNextStep({ currentStep, step, steps }) ||
      isBorrowStepValid({ currentStep, formState: form.state })
    )
      setCurrentStep(step)
    else throw new Error(`A state of current step in not valid.`)
  }
  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (steps[i]) setCurrentStep(steps[i])
    else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }

  const setupStepManager = (): AjnaBorrowSteps => {
    return {
      currentStep,
      steps,
      editingStep: props.flow === 'open' ? 'setup' : 'manage',
      isExternalStep: isExternalStep({ currentStep }),
      isStepWithTransaction: isStepWithTransaction({ currentStep }),
      isStepValid: isBorrowStepValid({ currentStep, formState: form.state }),
      setStep,
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
    }
  }

  const setupTxManager = (): AjnaBorrowTx => {
    return {
      txDetails,
      setTxDetails,
      setSimulationData,
      setIsLoadingSimulation,
      simulation: {
        data: simulationData,
        isLoading: isLoadingSimulation,
      },
      ...getTxStatuses(txDetails?.txStatus),
    }
  }

  const [context, setContext] = useState<AjnaBorrowContext>({
    environment: { ...props, isOwner: props.owner === walletAddress || props.flow === 'open' },
    form,
    position,
    steps: setupStepManager(),
    tx: setupTxManager(),
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      environment: {
        ...prev.environment,
        isOwner: props.owner === walletAddress || props.flow === 'open',
        collateralBalance: props.collateralBalance,
        quoteBalance: props.quoteBalance,
      },
      form: { ...prev.form, state: form.state },
      steps: setupStepManager(),
      tx: setupTxManager(),
    }))
  }, [
    props.collateralBalance,
    props.quoteBalance,
    form.state,
    currentStep,
    txDetails,
    simulationData,
    isLoadingSimulation,
  ])

  return <ajnaBorrowContext.Provider value={context}>{children}</ajnaBorrowContext.Provider>
}
