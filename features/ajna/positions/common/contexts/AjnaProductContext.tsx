import type { AjnaEarnPosition, SwapData } from '@oasisdex/dma-library'
import { AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaSimulationData } from 'actions/ajna'
import { useGasEstimationContext, useProductContext } from 'components/context'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type {
  AjnaGenericPosition,
  AjnaProduct,
  AjnaValidationItem,
} from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { useAjnaBorrowFormReducto } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import type { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto.types'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { formatSwapData } from 'features/ajna/positions/common/helpers/formatSwapData'
import { getAjnaNotifications } from 'features/ajna/positions/common/notifications'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getAjnaValidation } from 'features/ajna/positions/common/validation'
import type { useAjnaEarnFormReducto } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import type { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto.types'
import type { useAjnaMultiplyFormReducto } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import type { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto.types'
import { useAppConfig } from 'helpers/config'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useEffect, useMemo, useState } from 'react'

interface AjnaProductContextProviderPropsWithBorrow {
  formReducto: typeof useAjnaBorrowFormReducto
  formDefaults: Partial<AjnaBorrowFormState>
  position: AjnaPosition
  product: 'borrow'
  positionAuction: AjnaBorrowishPositionAuction
  positionHistory: AjnaUnifiedHistoryEvent[]
}

interface AjnaProductContextProviderPropsWithEarn {
  formReducto: typeof useAjnaEarnFormReducto
  formDefaults: Partial<AjnaEarnFormState>
  position: AjnaEarnPosition
  product: 'earn'
  positionAuction: AjnaEarnPositionAuction
  positionHistory: AjnaUnifiedHistoryEvent[]
}

interface AjnaProductContextProviderPropsWithMultiply {
  formReducto: typeof useAjnaMultiplyFormReducto
  formDefaults: Partial<AjnaMultiplyFormState>
  position: AjnaPosition
  product: 'multiply'
  positionAuction: AjnaBorrowishPositionAuction
  positionHistory: AjnaUnifiedHistoryEvent[]
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
  swap?: {
    current?: SwapData
    cached?: SwapData
  }
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: (positionSet: AjnaPositionSet<AjnaGenericPosition>) => void
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<AjnaGenericPosition> | undefined>>
  setCachedSwap: (swap: SwapData) => void
  positionAuction: A
  history: AjnaUnifiedHistoryEvent[]
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
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = useAppConfig('features')
  const { walletAddress } = useAccount()
  const gasEstimation = useGasEstimationContext()
  const { positionIdFromDpmProxy$ } = useProductContext()

  const {
    environment: {
      collateralBalance,
      collateralPrecision,
      collateralToken,
      ethBalance,
      ethPrice,
      flow,
      quoteBalance,
      quotePrecision,
      quoteToken,
      isOracless,
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
  const [cachedSwap, setCachedSwap] = useState<SwapData>()
  const [simulation, setSimulation] = useState<AjnaSimulationData<typeof position>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)

  // We need to determine the direction of the swap based on change in position risk
  let isIncreasingPositionRisk = true
  if (isAjnaPosition(simulation?.position) && isAjnaPosition(position) && simulation) {
    isIncreasingPositionRisk = simulation.position.riskRatio.loanToValue.gte(
      position.riskRatio.loanToValue,
    )
  }

  const validation = useMemo(
    () =>
      getAjnaValidation({
        ajnaSafetySwitchOn,
        flow,
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
        isOracless,
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
      setCachedSwap: (swap) => setCachedSwap(swap),
    },
    validation,
    notifications,
  })

  useEffect(() => {
    const fromTokenPrecision = isIncreasingPositionRisk ? quotePrecision : collateralPrecision
    const toTokenPrecision = isIncreasingPositionRisk ? collateralPrecision : quotePrecision

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
        swap: {
          current: formatSwapData({
            swapData: simulation?.swaps[0],
            fromTokenPrecision,
            toTokenPrecision,
          }),
          cached: cachedSwap,
        },
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
    cachedSwap,
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

function isAjnaPosition(position: any): position is AjnaPosition {
  return position instanceof AjnaPosition && typeof position.riskRatio === 'object'
}
