import { AjnaSimulationData } from 'actions/ajna'
import { useAppContext } from 'components/AppContextProvider'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { defaultErrors, defaultWarnings } from 'features/ajna/borrow/validations'
import { AjnaProduct } from 'features/ajna/common/types'
import { useAjnaGeneralContext } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaEarnPosition } from 'features/ajna/earn/fakePosition'
import { useAjnaEarnFormReducto } from 'features/ajna/earn/state/ajnaEarnFormReducto'
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

interface AjnaProductContextProviderPropsWithBorrow {
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaPosition
  product: 'borrow'
}
interface AjnaProductContextProviderPropsWithEarn {
  form: ReturnType<typeof useAjnaEarnFormReducto>
  position: AjnaEarnPosition
  product: 'earn'
}
interface AjnaProductContextProviderPropsWithMultiply {
  // TODO: to be replaced with useAjnaMultiplyFormReducto when availavble
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaPosition
  product: 'multiply'
}
type AjnaProductDetailsContextProviderProps =
  | AjnaProductContextProviderPropsWithBorrow
  | AjnaProductContextProviderPropsWithEarn
  | AjnaProductContextProviderPropsWithMultiply

interface AjnaPositionSet<P> {
  position: P
  simulation?: P
}

interface AjnaProductContextPosition<P> {
  cachedPosition?: AjnaPositionSet<P>
  currentPosition: AjnaPositionSet<P>
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: Dispatch<SetStateAction<AjnaPositionSet<P> | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<P> | undefined>>
}

interface AjnaProductContext<P, F> {
  form: F
  position: AjnaProductContextPosition<P>
  validation: {
    errors: ValidationMessagesInput
    isFormValid: boolean
    warnings: ValidationMessagesInput
  }
}

type AjnaProductContextWithBorrow = AjnaProductContext<
  AjnaPosition,
  ReturnType<typeof useAjnaBorrowFormReducto>
>
type AjnaProductContextWithEarn = AjnaProductContext<
  AjnaEarnPosition,
  ReturnType<typeof useAjnaEarnFormReducto>
>

const ajnaBorrowContext = React.createContext<AjnaProductContextWithBorrow | undefined>(undefined)
const ajnaEarnContext = React.createContext<AjnaProductContextWithEarn | undefined>(undefined)

type PickProductType<T extends AjnaProduct> = T extends 'borrow'
  ? AjnaProductContextWithBorrow
  : T extends 'earn'
  ? AjnaProductContextWithEarn // TODO: Add AjnaProductContextWithMultiply
  : never

export function useAjnaProductContext<T extends AjnaProduct>(product: T): PickProductType<T> {
  const { environment } = useAjnaGeneralContext()
  const context = product === 'borrow' ? useContext(ajnaBorrowContext) : useContext(ajnaEarnContext)

  if (product !== environment.product)
    throw new Error(
      `AjnaGeneralContext and AjnaProductContext products doesn't match: ${environment.product}/${product}`,
    )
  if (!context) throw new Error('AjnaProductContext not available!')
  return context as PickProductType<T>
}

export function AjnaProductContextProvider({
  children,
  form,
  product,
  position,
}: PropsWithChildren<AjnaProductDetailsContextProviderProps>) {
  const { walletAddress } = useAccount()
  const { positionIdFromDpmProxy$ } = useAppContext()
  const {
    environment: { collateralBalance, quoteBalance },
    steps: { currentStep },
    tx: { txDetails },
  } = useAjnaGeneralContext()
  const {
    state: { dpmAddress },
  } = form

  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(dpmAddress), [dpmAddress]),
  )

  const [cachedPosition, setCachedPosition] = useState<AjnaPositionSet<typeof position>>()
  const [simulation, setSimulation] = useState<AjnaSimulationData<typeof position>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)

  // TODO: replace with real validations
  const errors = defaultErrors
  const warnings = defaultWarnings
  const isFormValid = true

  const [context, setContext] = useState<AjnaProductContext<typeof position, typeof form>>({
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
    validation: { errors, isFormValid, warnings },
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      form,
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
      validation: { errors, isFormValid, warnings },
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

  switch (product) {
    case 'borrow':
      return (
        <ajnaBorrowContext.Provider value={context as AjnaProductContextWithBorrow}>
          {children}
        </ajnaBorrowContext.Provider>
      )
    case 'earn':
      return (
        <ajnaEarnContext.Provider value={context as AjnaProductContextWithEarn}>
          {children}
        </ajnaEarnContext.Provider>
      )
    case 'multiply':
      return <></>
  }
}
