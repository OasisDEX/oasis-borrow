import { AjnaSimulationData } from 'actions/ajna'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { isBorrowFormValid } from 'features/ajna/borrow/contexts/isBorrowFormValid'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import {
  defaultErrors,
  defaultWarnings,
  getAjnaBorrowValidations,
} from 'features/ajna/borrow/validations'
import {
  AjnaPositionSet,
  AjnaProductPosition,
  AjnaProductValidation,
} from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

interface AjnaBorrowContextProviderProps {
  position: AjnaPosition
}

type AjnaBorrowContext = AjnaProductValidation & {
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaProductPosition<AjnaPosition>
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
}: PropsWithChildren<AjnaBorrowContextProviderProps>) {
  const { walletAddress } = useAccount()
  const gasEstimation = useGasEstimationContext()
  const {
    environment: { collateralBalance, collateralToken, ethBalance, ethPrice, flow, quoteBalance },
    steps: { currentStep },
    tx: { txDetails },
  } = useAjnaProductContext()

  const form = useAjnaBorrowFormReducto({
    action: flow === 'open' ? 'openBorrow' : 'depositBorrow',
  })
  const { positionIdFromDpmProxy$ } = useAppContext()
  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(form.state.dpmAddress), [form.state.dpmAddress]),
  )

  const [simulation, setSimulation] = useState<AjnaSimulationData<AjnaPosition>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  const [cachedPosition, setCachedPosition] = useState<AjnaPositionSet<AjnaPosition>>()

  const { errors, warnings } = useMemo(
    () =>
      getAjnaBorrowValidations({
        collateralBalance,
        collateralToken,
        depositAmount: form.state.depositAmount,
        ethBalance,
        ethPrice,
        gasEstimationUsd: gasEstimation?.usdValue,
        paybackAmount: form.state.paybackAmount,
        quoteBalance,
        simulationErrors: simulation?.errors,
        simulationWarnings: simulation?.errors,
        txError: txDetails?.txError,
      }),
    [
      collateralBalance.toString(),
      collateralToken,
      ethBalance.toString(),
      ethPrice.toString(),
      form.state.depositAmount?.toString(),
      form.state.paybackAmount?.toString(),
      gasEstimation?.usdValue.toString(),
      quoteBalance.toString(),
      simulation?.errors,
      txDetails?.txError,
    ],
  )

  const [context, setContext] = useState<AjnaBorrowContext>({
    form,
    position: {
      cachedPosition,
      currentPosition: { position },
      isSimulationLoading,
      resolvedId: positionIdFromDpmProxyData,
      setCachedPosition,
      setIsLoadingSimulation,
      setSimulation,
    },
    validation: {
      errors: defaultErrors,
      isFormValid: isBorrowFormValid({ currentStep, formState: form.state, errors }),
      warnings: defaultWarnings,
    },
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        cachedPosition,
        currentPosition: {
          position,
          simulation: simulation?.position,
        },
        isSimulationLoading,
        resolvedId: positionIdFromDpmProxyData,
      },
      form: { ...prev.form, state: form.state },
      validation: {
        errors,
        isFormValid: isBorrowFormValid({ currentStep, formState: form.state, errors }),
        warnings,
      },
    }))
  }, [
    cachedPosition,
    collateralBalance,
    currentStep,
    errors,
    form.state,
    isSimulationLoading,
    position,
    positionIdFromDpmProxyData,
    quoteBalance,
    simulation,
    txDetails,
    warnings,
    walletAddress,
  ])

  return <ajnaBorrowContext.Provider value={context}>{children}</ajnaBorrowContext.Provider>
}
