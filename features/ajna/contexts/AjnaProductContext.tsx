import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { externalSteps } from 'features/ajna/common/consts'
import { AjnaStatusStep } from 'features/ajna/common/types'
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'

interface AjnaProductContextProviderProps {
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  quotePrice: BigNumber
  quoteToken: string
}

// external data, could be extended later by some stuff that comes from calculationsm, not directly from outside
type AjnaEnvironment = AjnaProductContextProviderProps

interface AjnaProductPosition {
  // ...
}

interface AjnaProductSteps {
  currentStep: AjnaStatusStep
  order: AjnaStatusStep[]
  isExternalStep: () => boolean
  setStep: (step: AjnaStatusStep) => void
}

interface AjnaProductContext {
  environment: AjnaEnvironment
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaProductPosition
  steps: AjnaProductSteps
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
  ...props
}: PropsWithChildren<AjnaProductContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const form = useAjnaBorrowFormReducto({})
  const [currentStep, setCurrentStep] = useState<AjnaStatusStep>('risk')

  const [context, setContext] = useState<AjnaProductContext>({
    environment: {
      ...props,
    },
    form,
    position: {},
    steps: {
      currentStep,
      order: ['risk', 'setup', 'confirm'],
      isExternalStep: () => externalSteps.includes(currentStep),
      setStep: (step) => setCurrentStep(step),
    },
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      environment: { ...prev.environment, collateralBalance: props.collateralBalance },
      form: { ...prev.form, state: form.state },
      steps: { ...prev.steps, step: currentStep },
    }))
  }, [props.collateralBalance, form.state, currentStep])

  return <ajnaProductContext.Provider value={context}>{children}</ajnaProductContext.Provider>
}
