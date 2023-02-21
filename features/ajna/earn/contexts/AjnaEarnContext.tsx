import { AjnaValidationItem } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { getAjnaBorrowValidations } from 'features/ajna/borrow/validations'
import { initializeAjnaContext } from 'features/ajna/common/initializeAjnaContext'
import { AjnaProductPosition } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { isEarnFormValid } from 'features/ajna/earn/contexts/isEarnFormValid'
import { useAjnaEarnFormReducto } from 'features/ajna/earn/state/ajnaEarnFormReducto'
import { zero } from 'helpers/zero'
import React, { PropsWithChildren, useContext } from 'react'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

interface AjnaEarnContextProviderProps {
  position: AjnaPosition
}

interface AjnaEarnContext {
  form: ReturnType<typeof useAjnaEarnFormReducto>
  position: AjnaProductPosition<AjnaPosition>
  validation: {
    errors: ValidationMessagesInput
    isFormValid: boolean
    warnings: ValidationMessagesInput
  }
}

const ajnaEarnContext = React.createContext<AjnaEarnContext | undefined>(undefined)

export function useAjnaEarnContext(): AjnaEarnContext {
  const ac = useContext(ajnaEarnContext)

  if (!ac) {
    throw new Error("AjnaEarnContext not available! useAjnaEarnContext can't be used serverside")
  }
  return ac
}

export function AjnaEarnContextProvider({
  children,
  position,
}: PropsWithChildren<AjnaEarnContextProviderProps>) {
  const {
    environment: { collateralBalance, collateralToken, ethBalance, ethPrice, flow, quoteBalance },
    steps: { currentStep },
    tx: { txDetails },
  } = useAjnaProductContext()

  const form = useAjnaEarnFormReducto({
    action: flow === 'open' ? 'open' : 'deposit',
  })

  function validationCallback({
    errors,
    usdValue,
  }: {
    errors?: AjnaValidationItem[]
    usdValue?: BigNumber
  }) {
    // TODO define validations for earn
    return getAjnaBorrowValidations({
      collateralBalance,
      collateralToken,
      depositAmount: form.state.depositAmount,
      ethBalance,
      ethPrice,
      gasEstimationUsd: usdValue,
      paybackAmount: zero,
      quoteBalance,
      simulationErrors: errors,
      simulationWarnings: errors,
      txError: txDetails?.txError,
    })
  }

  function isFormValidCallback({ errors }: { errors: ValidationMessagesInput }) {
    return isEarnFormValid({ currentStep, formState: form.state, errors })
  }

  const context = initializeAjnaContext<AjnaEarnContext, AjnaPosition>({
    form,
    collateralBalance,
    currentStep,
    position,
    quoteBalance,
    txDetails,
    validationCallback,
    isFormValidCallback,
  })

  return <ajnaEarnContext.Provider value={context}>{children}</ajnaEarnContext.Provider>
}
