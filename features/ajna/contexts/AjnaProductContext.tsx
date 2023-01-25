import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { isBorrowStepValid } from 'features/ajna/borrow/ajnaBorrowStepManager'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { isExternalStep, isStepWithBack } from 'features/ajna/contexts/ajnaStepManager'
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
  isStepValid: boolean
  setStep: (step: AjnaStatusStep) => void
  setNextStep: () => void
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
  const order: AjnaStatusStep[] = ['risk', 'setup', 'confirm']

  const setStep = (step: AjnaStatusStep) => {
    setCurrentStep(step)
  }
  const shiftStep = (direction: 'prev' | 'next') => {
    const i = order.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (order[i]) setCurrentStep(order[order.indexOf(currentStep) + 1])
    else console.error(`index ${i} exceeds `)
  }
  const setNextStep = () => {
    setCurrentStep(order[order.indexOf(currentStep) + 1])
  }

  const setupStepManager = () => {
    return {
      currentStep,
      order,
      isExternalStep: isExternalStep({ currentStep }),
      isStepWithBack: isStepWithBack({ currentStep }),
      isStepValid: isBorrowStepValid({ currentStep, formState: form.state }),
      setStep,
      setNextStep,
    }
  }

  const [context, setContext] = useState<AjnaBorrowContext>({
    environment: {
      ...props,
    },
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
