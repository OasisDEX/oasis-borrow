import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { isBorrowStepValid } from 'features/ajna/borrow/ajnaBorrowStepManager'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import {
  isExternalStep,
  isStepWithBack,
  isStepWithTransaction,
} from 'features/ajna/contexts/ajnaStepManager'
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'

interface AjnaBorrowContextProviderProps {
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  product: AjnaProduct
  quotePrice: BigNumber
  quoteToken: string
}

// external data, could be extended later by some stuff that comes from calculationsm, not directly from outside
type AjnaBorrowEnvironment = AjnaBorrowContextProviderProps

interface AjnaBorrowPosition {
  // ...
}

interface AjnaBorrowSteps {
  currentStep: AjnaStatusStep
  order: AjnaStatusStep[]
  isExternalStep: boolean
  isStepWithBack: boolean
  isStepWithTransaction: boolean
  isStepValid: boolean
  setStep: (step: AjnaStatusStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface AjnaBorrowContext {
  environment: AjnaBorrowEnvironment
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaBorrowPosition
  steps: AjnaBorrowSteps
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
  ...props
}: PropsWithChildren<AjnaBorrowContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const form = useAjnaBorrowFormReducto({})
  const [currentStep, setCurrentStep] = useState<AjnaStatusStep>('risk')
  const order: AjnaStatusStep[] = ['risk', 'setup', 'confirm', 'progress', 'failure', 'success']

  const setStep = (step: AjnaStatusStep) => {
    if (isBorrowStepValid({ currentStep, formState: form.state })) setCurrentStep(step)
    else throw new Error(`A state of current step in not valid.`)
  }
  const shiftStep = (direction: 'next' | 'prev') => {
    const i = order.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (order[i]) {
      if (direction === 'next' && isStepWithTransaction({ currentStep })) void transactionStep()
      else setCurrentStep(order[i])
    } else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }
  const transactionStep = async () => {
    setStep('progress')

    const fakeTransactionStatus = await simulateFakeTransaction()

    setStep(fakeTransactionStatus ? 'success' : 'failure')
  }

  const setupStepManager = () => {
    return {
      currentStep,
      order,
      isExternalStep: isExternalStep({ currentStep }),
      isStepWithBack: isStepWithBack({ currentStep }),
      isStepWithTransaction: isStepWithTransaction({ currentStep }),
      isStepValid: isBorrowStepValid({ currentStep, formState: form.state }),
      setStep,
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
    }
  }

  const [context, setContext] = useState<AjnaBorrowContext>({
    environment: { ...props },
    form,
    position: {},
    steps: setupStepManager(),
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      environment: { ...prev.environment, collateralBalance: props.collateralBalance },
      form: { ...prev.form, state: form.state },
      steps: setupStepManager(),
    }))
  }, [props.collateralBalance, form.state, currentStep])

  return <ajnaBorrowContext.Provider value={context}>{children}</ajnaBorrowContext.Provider>
}

async function simulateFakeTransaction(): Promise<boolean> {
  return await new Promise((resolve) => {
    const interval = setInterval(() => {
      clearInterval(interval)
      resolve(Math.random() > 0.2)
    }, Math.floor(Math.random() * (3000 - 1000) + 1000))
  })
}
