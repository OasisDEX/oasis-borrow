import { AjnaSimulationData } from 'actions/ajna'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { isBorrowFormValid } from 'features/ajna/borrow/contexts/isBorrowFormValid'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import {
  defaultErrors,
  defaultWarnings,
  getAjnaBorrowValidations,
} from 'features/ajna/borrow/validations'
import { useAjnaGeneralContext } from 'features/ajna/contexts/AjnaProductContext'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

interface AjnaBorrowContextProviderProps {
  position: AjnaPosition
}

type AjnaBorrowPositionSet = {
  position: AjnaPosition
  simulation?: AjnaPosition
}

export interface AjnaBorrowPosition {
  cachedPosition?: AjnaBorrowPositionSet
  currentPosition: AjnaBorrowPositionSet
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: Dispatch<SetStateAction<AjnaBorrowPositionSet | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData | undefined>>
}

interface AjnaBorrowContext {
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaBorrowPosition
  validation: {
    errors: ValidationMessagesInput
    isFormValid: boolean
    warnings: ValidationMessagesInput
  }
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
  } = useAjnaGeneralContext()

  const form = useAjnaBorrowFormReducto({
    action: flow === 'open' ? 'open' : 'deposit',
  })
  const { positionIdFromDpmProxy$ } = useAppContext()
  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(form.state.dpmAddress), [form.state.dpmAddress]),
  )

  const [simulation, setSimulation] = useState<AjnaSimulationData>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  const [cachedPosition, setCachedPosition] = useState<AjnaBorrowPositionSet>()

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
