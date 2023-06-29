import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { AjnaSimulationData } from 'actions/ajna'
import { useAppContext } from 'components/AppContextProvider'
import { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { AjnaGenericPosition, AjnaProduct, AjnaValidationItem } from 'features/ajna/common/types'
import {
  AjnaBorrowFormState,
  useAjnaBorrowFormReducto,
} from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaHistoryEvents } from 'features/ajna/positions/common/helpers/getAjnaHistory'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAuction'
import { getAjnaValidation } from 'features/ajna/positions/common/validation'
import {
  AjnaEarnFormState,
  useAjnaEarnFormReducto,
} from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import {
  AjnaMultiplyFormState,
  useAjnaMultiplyFormReducto,
} from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface AjnaProductContextProviderPropsWithBorrow {
  formReducto: typeof useAjnaBorrowFormReducto
  formDefaults: Partial<AjnaBorrowFormState>
  position: AjnaPosition
  product: 'borrow'
  positionAuction: AjnaBorrowishPositionAuction
  positionHistory: AjnaHistoryEvents
}
interface AjnaProductContextProviderPropsWithEarn {
  formReducto: typeof useAjnaEarnFormReducto
  formDefaults: Partial<AjnaEarnFormState>
  position: AjnaEarnPosition
  product: 'earn'
  positionAuction: AjnaEarnPositionAuction
  positionHistory: AjnaHistoryEvents
}
interface AjnaProductContextProviderPropsWithMultiply {
  formReducto: typeof useAjnaMultiplyFormReducto
  formDefaults: Partial<AjnaMultiplyFormState>
  position: AjnaPosition
  product: 'multiply'
  positionAuction: AjnaBorrowishPositionAuction
  positionHistory: AjnaHistoryEvents
}
type AjnaProductDetailsContextProviderProps =
  | AjnaProductContextProviderPropsWithBorrow
  | AjnaProductContextProviderPropsWithEarn
  | AjnaProductContextProviderPropsWithMultiply

interface AjnaPositionSet<P> {
  position: P
  simulation?: P
}

interface AjnaProductContextPosition<P, A> {
  cachedPosition?: AjnaPositionSet<P>
  currentPosition: AjnaPositionSet<P>
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: (positionSet: AjnaPositionSet<AjnaGenericPosition>) => void
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<AjnaGenericPosition> | undefined>>
  positionAuction: A
  history: AjnaHistoryEvents
}

interface AjnaProductContext<P, F, A> {
  form: F
  position: AjnaProductContextPosition<P, A>
  validation: {
    errors: AjnaValidationItem[]
    hasErrors: boolean
    isFormFrozen: boolean
    isFormValid: boolean
    notices: AjnaValidationItem[]
    successes: AjnaValidationItem[]
    warnings: AjnaValidationItem[]
  }
  notifications: DetailsSectionNotificationItem[]
}

type AjnaProductContextWithBorrow = AjnaProductContext<
  AjnaPosition,
  ReturnType<typeof useAjnaBorrowFormReducto>,
  AjnaBorrowishPositionAuction
>
type AjnaProductContextWithEarn = AjnaProductContext<
  AjnaEarnPosition,
  ReturnType<typeof useAjnaEarnFormReducto>,
  AjnaEarnPositionAuction
>
type AjnaProductContextWithMultiply = AjnaProductContext<
  AjnaPosition,
  ReturnType<typeof useAjnaMultiplyFormReducto>,
  AjnaBorrowishPositionAuction
>

const ajnaBorrowContext = React.createContext<AjnaProductContextWithBorrow | undefined>(undefined)
const ajnaEarnContext = React.createContext<AjnaProductContextWithEarn | undefined>(undefined)
const ajnaMultiplyContext = React.createContext<AjnaProductContextWithMultiply | undefined>(
  undefined,
)

type PickProductType<T extends AjnaProduct> = T extends 'borrow'
  ? AjnaProductContextWithBorrow
  : T extends 'earn'
  ? AjnaProductContextWithEarn
  : T extends 'multiply'
  ? AjnaProductContextWithMultiply
  : never

export function useAjnaProductContext<T extends AjnaProduct>(product: T): PickProductType<T> {
  const { environment } = useAjnaGeneralContext()
  const context =
    product === 'borrow'
      ? useContext(ajnaBorrowContext)
      : product === 'earn'
      ? useContext(ajnaEarnContext)
      : useContext(ajnaMultiplyContext)

  if (product !== environment.product)
    throw new Error(
      `AjnaGeneralContext and AjnaProductContext products doesn't match: ${environment.product}/${product}`,
    )
  if (!context) throw new Error('AjnaProductContext not available!')
  return context as PickProductType<T>
}

export function AjnaProductContextProvider({
  children,
  formDefaults,
  formReducto,
  product,
  position,
  positionAuction,
  positionHistory,
}: PropsWithChildren<AjnaProductDetailsContextProviderProps>) {
  const ajnaSafetySwitchOn = useFeatureToggle('AjnaSafetySwitch')
  const { walletAddress } = useAccount()
  const gasEstimation = useGasEstimationContext()
  const { positionIdFromDpmProxy$ } = useAppContext()

  const {
    environment: {
      collateralBalance,
      collateralToken,
      ethBalance,
      ethPrice,
      flow,
      quoteBalance,
      quoteToken,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useAjnaGeneralContext()
  // TODO: find a way to distinguish between the types - there no place for error here except for typescript is too stupid to understand
  // @ts-expect-error
  const form = formReducto(formDefaults)
  const { state } = form

  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(state.dpmAddress), [state.dpmAddress]),
  )

  const [cachedPosition, setCachedPosition] = useState<AjnaPositionSet<typeof position>>()
  const [simulation, setSimulation] = useState<AjnaSimulationData<typeof position>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)

  const validation = useMemo(
    () =>
      getAjnaValidation({
        collateralBalance,
        collateralToken,
        quoteToken,
        currentStep,
        ethBalance,
        ethPrice,
        gasEstimationUsd: gasEstimation?.usdValue,
        product,
        quoteBalance,
        simulationErrors: simulation?.errors,
        simulationWarnings: simulation?.warnings,
        simulationNotices: simulation?.notices,
        simulationSuccesses: simulation?.successes,
        state,
        position,
        positionAuction,
        txError: txDetails?.txError,
      }),
    [
      currentStep,
      collateralBalance.toNumber(),
      collateralToken,
      quoteToken,
      ethBalance.toNumber(),
      ethPrice.toNumber(),
      gasEstimation?.usdValue.toNumber(),
      quoteBalance.toNumber(),
      simulation?.errors,
      state,
      txDetails?.txError,
    ],
  )

  const notifications = useMemo(
    () =>
      getAjnaNotifications({
        ajnaSafetySwitchOn,
        flow,
        position,
        positionAuction,
        product,
        quoteToken,
        collateralToken,
        dispatch: form.dispatch,
        updateState: form.updateState,
      }),
    [quoteToken, collateralToken, position],
  )

  const [context, setContext] = useState<
    AjnaProductContext<typeof position, typeof form, typeof positionAuction>
  >({
    form,
    position: {
      cachedPosition,
      positionAuction,
      currentPosition: { position },
      isSimulationLoading,
      resolvedId: positionIdFromDpmProxyData,
      history: positionHistory,
      setCachedPosition: (positionSet) => setCachedPosition(positionSet),
      setIsLoadingSimulation,
      setSimulation,
    },
    validation,
    notifications,
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
        positionAuction,
        history: positionHistory,
      },
      validation,
      notifications,
    }))
  }, [
    cachedPosition,
    collateralBalance,
    currentStep,
    ethBalance,
    ethPrice,
    state,
    isSimulationLoading,
    position,
    positionIdFromDpmProxyData,
    quoteBalance,
    simulation,
    txDetails,
    validation,
    notifications,
    walletAddress,
    positionHistory,
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
      return (
        <ajnaMultiplyContext.Provider value={context as AjnaProductContextWithMultiply}>
          {children}
        </ajnaMultiplyContext.Provider>
      )
  }
}
