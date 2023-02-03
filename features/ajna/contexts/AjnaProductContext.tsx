import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { isBorrowStepValid } from 'features/ajna/borrow/ajnaBorrowStepManager'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { isExternalStep, isStepWithTransaction } from 'features/ajna/contexts/ajnaStepManager'
import { getTxStatuses } from 'features/ajna/contexts/ajnaTxManager'
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
  flow: AjnaFlow
  product: AjnaProduct
  quoteBalance: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  position: AjnaBorrowPosition
  steps: AjnaStatusStep[]
}

type AjnaBorrowEnvironment = Omit<AjnaBorrowContextProviderProps, 'position' | 'steps'>

// temporary, interface will come from MPA
interface AjnaBorrowPosition {
  id?: string
}

interface AjnaBorrowSteps {
  currentStep: AjnaStatusStep
  editingStep: Extract<AjnaStatusStep, 'setup' | 'manage'>
  isExternalStep: boolean
  isStepWithTransaction: boolean
  isStepValid: boolean
  steps: AjnaStatusStep[]
  txStatus?: TxStatus
  setStep: (step: AjnaStatusStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface AjnaBorrowTx {
  txStatus?: TxStatus
  isTxError: boolean
  isTxStarted: boolean
  isTxWaitingForApproval: boolean
  isTxInProgress: boolean
  isTxSuccess: boolean
  setTxStatus: Dispatch<SetStateAction<TxStatus | undefined>>
}

interface AjnaBorrowContext {
  environment: AjnaBorrowEnvironment
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
  const [currentStep, setCurrentStep] = useState<AjnaStatusStep>(steps[0])
  const [txStatus, setTxStatus] = useState<TxStatus>()

  useEffect(() => {
    console.log(`currentStep was changed, new value: ${currentStep}`)
  }, [currentStep])

  const setStep = (step: AjnaStatusStep) => {
    if (isBorrowStepValid({ currentStep, formState: form.state })) setCurrentStep(step)
    else throw new Error(`A state of current step in not valid.`)
  }
  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    console.log(`currentStep: ${currentStep}`)
    console.log(`steps: ${steps}`)
    console.log(`steps.indexOf(currentStep): ${steps.indexOf(currentStep)}`)
    console.log(`i: ${i}`)

    if (direction === 'next') {
      if (steps[i]) setCurrentStep(steps[i])
      else throw new Error(`A step with index ${i} does not exist in form flow.`)
    }
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
      txStatus,
      setTxStatus,
      ...getTxStatuses(txStatus),
    }
  }

  const [context, setContext] = useState<AjnaBorrowContext>({
    environment: { ...props },
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
        collateralBalance: props.collateralBalance,
        quoteBalance: props.quoteBalance,
      },
      form: { ...prev.form, state: form.state },
      steps: setupStepManager(),
      tx: setupTxManager(),
    }))
  }, [props.collateralBalance, props.quoteBalance, form.state, currentStep, txStatus])

  return <ajnaBorrowContext.Provider value={context}>{children}</ajnaBorrowContext.Provider>
}
