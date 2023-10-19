import type { AjnaEarnPosition, BorrowishPosition, SwapData } from '@oasisdex/dma-library'
import { AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaSimulationData } from 'actions/ajna'
import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { formatSwapData } from 'features/ajna/positions/common/helpers/formatSwapData'
import type { OmniDupePositionModalProps } from 'features/omni-kit/common/components/OmniDupePositionModal'
import type { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow/borrowFormReducto'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow/borrowFormReducto.types'
import type { useOmniEarnFormReducto } from 'features/omni-kit/state/earn/earnFormReducto'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import type { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply/multiplyFormReducto'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply/multiplyFormReducto.types'
import type {
  OmniGenericPosition,
  OmniProduct,
  OmniSimulationCommon,
  OmniValidations,
} from 'features/omni-kit/types/common.types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

import { useOmniGeneralContext } from './OmniGeneralContext'

export type DynamicProductMetadata = (product: OmniProduct) => {
  validations: OmniValidations
  notifications: DetailsSectionNotificationItem[]
  handlers: {
    txHandler: () => void
  }
  values: {
    debtMin: BigNumber
    debtMax: BigNumber
    interestRate: BigNumber
    afterAvailableToBorrow: BigNumber | undefined
    afterPositionDebt: BigNumber | undefined
    netBorrowCost: BigNumber
    afterBuyingPower: BigNumber | undefined
    collateralMax: BigNumber
    paybackMax: BigNumber
    shouldShowDynamicLtv: boolean
    changeVariant: 'positive' | 'negative'
    sidebarTitle: string
    footerColumns: number
  }
  elements: {
    overviewBanner: JSX.Element | undefined
    riskSidebar: JSX.Element
    overviewContent: JSX.Element
    overviewFooter: JSX.Element
    highlighterOrderInformation: JSX.Element | undefined
    dupeModal: (props: OmniDupePositionModalProps) => JSX.Element
  }
  filters: {
    flowStateFilter: (event: CreatePositionEvent) => boolean
    consumedProxyFilter: (event: CreatePositionEvent) => boolean
  }
  featureToggles: {
    safetySwitch: boolean
    suppressValidation: boolean
    reusableDpm: boolean
  }
}

interface ProductContextProviderPropsWithBorrow {
  dynamicMetadata: DynamicProductMetadata
  formReducto: typeof useOmniBorrowFormReducto
  formDefaults: Partial<OmniBorrowFormState>
  position: BorrowishPosition
  product: 'borrow'
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
}

interface ProductContextProviderPropsWithEarn {
  dynamicMetadata: DynamicProductMetadata
  formReducto: typeof useOmniEarnFormReducto
  formDefaults: Partial<OmniEarnFormState>
  position: AjnaEarnPosition
  product: 'earn'
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
}

interface ProductContextProviderPropsWithMultiply {
  dynamicMetadata: DynamicProductMetadata
  formReducto: typeof useOmniMultiplyFormReducto
  formDefaults: Partial<OmniMultiplyFormState>
  position: BorrowishPosition
  product: 'multiply'
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
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
  setCachedPosition: (positionSet: PositionSet<OmniGenericPosition>) => void
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<OmniGenericPosition> | undefined>>
  setCachedSwap: (swap: SwapData) => void
  positionAuction: A
  history: PositionHistoryEvent[]
  simulationCommon: OmniSimulationCommon
}

interface GenericProductContext<P, F, A> {
  form: F
  position: ProductContextPosition<P, A>
  dynamicMetadata: DynamicProductMetadata
}

export type ProductContextWithBorrow = GenericProductContext<
  BorrowishPosition,
  ReturnType<typeof useOmniBorrowFormReducto>,
  unknown
>

type ProductContextWithEarn = GenericProductContext<
  AjnaEarnPosition,
  ReturnType<typeof useOmniEarnFormReducto>,
  unknown
>

export type ProductContextWithMultiply = GenericProductContext<
  BorrowishPosition,
  ReturnType<typeof useOmniMultiplyFormReducto>,
  unknown
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
  dynamicMetadata,
  children,
  formDefaults,
  formReducto,
  product,
  position,
  positionAuction,
  positionHistory,
}: PropsWithChildren<ProductDetailsContextProviderProps>) {
  const { walletAddress } = useAccount()
  const { positionIdFromDpmProxy$ } = useProductContext()

  const {
    environment: {
      collateralBalance,
      collateralPrecision,
      ethBalance,
      ethPrice,
      quoteBalance,
      quotePrecision,
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
  simulation?.errors
  const [context, setContext] = useState<
    GenericProductContext<typeof position, typeof form, typeof positionAuction>
  >({
    dynamicMetadata,
    form,
    position: {
      cachedPosition,
      positionAuction,
      currentPosition: { position },
      isSimulationLoading,
      resolvedId: positionIdFromDpmProxyData,
      history: positionHistory,
      simulationCommon: {
        errors: simulation?.errors as OmniSimulationCommon['errors'],
        warnings: simulation?.warnings as OmniSimulationCommon['warnings'],
        notices: simulation?.notices as OmniSimulationCommon['notices'],
        successes: simulation?.successes as OmniSimulationCommon['successes'],
      },
      setCachedPosition: (positionSet) => setCachedPosition(positionSet),
      setIsLoadingSimulation,
      setSimulation,
      setCachedSwap: (swap) => setCachedSwap(swap),
    },
  })

  useEffect(() => {
    const fromTokenPrecision = isIncreasingPositionRisk ? quotePrecision : collateralPrecision
    const toTokenPrecision = isIncreasingPositionRisk ? collateralPrecision : quotePrecision

    setContext((prev) => ({
      ...prev,
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
    }))
  }, [
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
