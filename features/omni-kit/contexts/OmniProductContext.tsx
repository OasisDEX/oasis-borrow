import type { AjnaEarnPosition, BorrowishPosition, SwapData } from '@oasisdex/dma-library'
import { AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaSimulationData } from 'actions/ajna'
import type BigNumber from 'bignumber.js'
import { useGasEstimationContext } from 'components/context/GasEstimationContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import { formatSwapData } from 'features/ajna/positions/common/helpers/formatSwapData'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow/borrowFormReducto.types'
import type { useOmniEarnFormReducto } from 'features/omni-kit/state/earn/earnFormReducto'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import type { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply/multiplyFormReducto.types'
import type { OmniProduct, OmniValidationItem } from 'features/omni-kit/types/common.types'
import { useAppConfig } from 'helpers/config'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { useOmniGeneralContext } from './OmniGeneralContext'

interface StaticProductMetadata {
  getValidation: any
  getNotifications: any
  customHehe: {
    zelipapo: string
    extraInput: React.ReactNode
  }
}

type DynamicProductMetadata = (product: OmniProduct) => {
  txHandler: () => void
  netBorrowCost: BigNumber
  afterBuyingPower: BigNumber | undefined
  highlighterOrderInformation: JSX.Element | undefined
  shouldShowDynamicLtv: boolean
  debtMin: BigNumber
  debtMax: BigNumber
  interestRate: BigNumber
  afterAvailableToBorrow: BigNumber | undefined
  afterPositionDebt: BigNumber | undefined
  extraOverviewCards: JSX.Element[]
  collateralMax: BigNumber
  paybackMax: BigNumber
  changeVariant: 'positive' | 'negative'
  overviewBanner: JSX.Element | undefined
  riskSidebar: JSX.Element
  sidebarTitle: string
}

interface ProductContextProviderPropsWithBorrow {
  staticMetadata: StaticProductMetadata
  dynamicMetadata: DynamicProductMetadata
  formReducto: typeof useOmniBorrowFormReducto
  formDefaults: Partial<OmniBorrowFormState>
  position: BorrowishPosition
  product: 'borrow'
  positionAuction: AjnaBorrowishPositionAuction // TODO auctions has to be fully configurable through staticMetadata
  positionHistory: AjnaUnifiedHistoryEvent[]
}

interface ProductContextProviderPropsWithEarn {
  staticMetadata: StaticProductMetadata
  dynamicMetadata: DynamicProductMetadata
  formReducto: typeof useOmniEarnFormReducto
  formDefaults: Partial<OmniEarnFormState>
  position: AjnaEarnPosition
  product: 'earn'
  positionAuction: AjnaEarnPositionAuction
  positionHistory: AjnaUnifiedHistoryEvent[]
}

interface ProductContextProviderPropsWithMultiply {
  staticMetadata: StaticProductMetadata
  dynamicMetadata: DynamicProductMetadata
  formReducto: typeof useOmniMultiplyFormReducto
  formDefaults: Partial<OmniMultiplyFormState>
  position: BorrowishPosition
  product: 'multiply'
  positionAuction: AjnaBorrowishPositionAuction
  positionHistory: AjnaUnifiedHistoryEvent[]
}

type ProductDetailsContextProviderProps =
  | ProductContextProviderPropsWithBorrow
  | ProductContextProviderPropsWithEarn
  | ProductContextProviderPropsWithMultiply

interface PositionSet<P> {
  position: P
  simulation?: P
}

interface ProductContextPosition<P, A> {
  cachedPosition?: PositionSet<P>
  currentPosition: PositionSet<P>
  swap?: {
    current?: SwapData
    cached?: SwapData
  }
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: (positionSet: PositionSet<AjnaGenericPosition>) => void
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<AjnaGenericPosition> | undefined>>
  setCachedSwap: (swap: SwapData) => void
  positionAuction: A
  history: AjnaUnifiedHistoryEvent[]
}

interface GenericProductContext<P, F, A> {
  form: F
  position: ProductContextPosition<P, A>
  validation: {
    errors: OmniValidationItem[]
    hasErrors: boolean
    isFormFrozen: boolean
    isFormValid: boolean
    notices: OmniValidationItem[]
    successes: OmniValidationItem[]
    warnings: OmniValidationItem[]
  }
  notifications: DetailsSectionNotificationItem[]
  staticMetadata: StaticProductMetadata
  dynamicMetadata: DynamicProductMetadata
}

export type ProductContextWithBorrow = GenericProductContext<
  BorrowishPosition,
  ReturnType<typeof useOmniBorrowFormReducto>,
  AjnaBorrowishPositionAuction
>

type ProductContextWithEarn = GenericProductContext<
  AjnaEarnPosition,
  ReturnType<typeof useOmniEarnFormReducto>,
  AjnaEarnPositionAuction
>

export type ProductContextWithMultiply = GenericProductContext<
  BorrowishPosition,
  ReturnType<typeof useOmniMultiplyFormReducto>,
  AjnaBorrowishPositionAuction
>

const borrowContext = React.createContext<ProductContextWithBorrow | undefined>(undefined)
const earnContext = React.createContext<ProductContextWithEarn | undefined>(undefined)
const multiplyContext = React.createContext<ProductContextWithMultiply | undefined>(undefined)

type PickProductType<T extends OmniProduct> = T extends 'borrow'
  ? ProductContextWithBorrow
  : T extends 'earn'
  ? ProductContextWithEarn
  : T extends 'multiply'
  ? ProductContextWithMultiply
  : never

export function useOmniProductContext<T extends OmniProduct>(product: T): PickProductType<T> {
  const { environment } = useOmniGeneralContext()

  const context =
    product === 'borrow'
      ? useContext(borrowContext)
      : product === 'earn'
      ? useContext(earnContext)
      : useContext(multiplyContext)

  if (product !== environment.product)
    throw new Error(
      `ProtocolGeneralContext and AjnaProductContext products doesn't match: ${environment.product}/${product}`,
    )
  if (!context) throw new Error('AjnaProductContext not available!')
  return context as PickProductType<T>
}

export function OmniProductContextProvider({
  // here we should inject staticMetadata
  staticMetadata,
  dynamicMetadata,
  children,
  formDefaults,
  formReducto,
  product,
  position,
  positionAuction,
  positionHistory,
}: PropsWithChildren<ProductDetailsContextProviderProps>) {
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
  } = useOmniGeneralContext()
  // TODO: find a way to distinguish between the types - there no place for error here except for typescript is too stupid to understand
  // @ts-expect-error
  const form = formReducto(formDefaults)
  const { state } = form

  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(state.dpmAddress), [state.dpmAddress]),
  )

  // TODO these could be potentially generalized within single hook
  const [cachedPosition, setCachedPosition] = useState<PositionSet<typeof position>>()
  const [cachedSwap, setCachedSwap] = useState<SwapData>()
  const [simulation, setSimulation] = useState<AjnaSimulationData<typeof position>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  // TODO these could be potentially generalized within single hook

  // We need to determine the direction of the swap based on change in position risk
  let isIncreasingPositionRisk = true
  if (isAjnaPosition(simulation?.position) && isAjnaPosition(position) && simulation) {
    isIncreasingPositionRisk = simulation.position.riskRatio.loanToValue.gte(
      position.riskRatio.loanToValue,
    )
  }

  const validation = useMemo(
    () =>
      staticMetadata.getValidation({
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
      staticMetadata.getNotifications({
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
    GenericProductContext<typeof position, typeof form, typeof positionAuction>
  >({
    staticMetadata,
    dynamicMetadata,
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
      staticMetadata,
      dynamicMetadata,
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
    staticMetadata,
    dynamicMetadata,
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
        <borrowContext.Provider value={context as ProductContextWithBorrow}>
          {children}
        </borrowContext.Provider>
      )
    case 'earn':
      return (
        <earnContext.Provider value={context as ProductContextWithEarn}>
          {children}
        </earnContext.Provider>
      )
    case 'multiply':
      return (
        <multiplyContext.Provider value={context as ProductContextWithMultiply}>
          {children}
        </multiplyContext.Provider>
      )
  }
}

function isAjnaPosition(position: any): position is AjnaPosition {
  return position instanceof AjnaPosition && typeof position.riskRatio === 'object'
}
