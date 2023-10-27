import type { LendingPosition, SupplyPosition, SwapData } from '@oasisdex/dma-library'
import { AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaSimulationData } from 'actions/ajna'
import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { formatSwapData } from 'features/ajna/positions/common/helpers/formatSwapData'
import type { OmniDupePositionModalProps } from 'features/omni-kit/components'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import type { OmniBorrowFormState, useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState, useOmniEarnFormReducto } from 'features/omni-kit/state/earn'
import type {
  OmniMultiplyFormState,
  useOmniMultiplyFormReducto,
} from 'features/omni-kit/state/multiply'
import type {
  OmniGenericPosition,
  OmniIsCachedPosition,
  OmniSimulationCommon,
  OmniValidations,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

export type LendingMetadata = {
  validations: OmniValidations
  notifications: DetailsSectionNotificationItem[]
  handlers: {
    customReset: () => void
  }
  values: {
    debtMin: BigNumber
    debtMax: BigNumber
    interestRate: BigNumber
    isFormEmpty: boolean
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

export type SupplyMetadata = {
  validations: OmniValidations
  notifications: DetailsSectionNotificationItem[]
  handlers: {
    txSuccessEarnHandler: () => void
    customReset: () => void
  }
  values: {
    interestRate: BigNumber
    isFormEmpty: boolean
    sidebarTitle: string
    footerColumns: number
    headlineDetails: HeadlineDetailsProp[]
    extraDropdownItems: SidebarSectionHeaderSelectItem[]
    earnWithdrawMax: BigNumber
  }
  elements: {
    overviewBanner: JSX.Element | undefined
    riskSidebar: JSX.Element
    overviewContent: JSX.Element
    overviewFooter: JSX.Element
    dupeModal: (props: OmniDupePositionModalProps) => JSX.Element
    extraEarnInput: JSX.Element
    extraEarnInputDeposit: JSX.Element
    extraEarnInputWithdraw: JSX.Element
    earnFormOrder: JSX.Element
    earnFormOrderAsElement: FC<OmniIsCachedPosition>
    earnExtraUiDropdownContent: JSX.Element
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

export type OmniMetadataParams =
  | Omit<ProductContextWithBorrow, 'dynamicMetadata'>
  | Omit<ProductContextWithEarn, 'dynamicMetadata'>
  | Omit<ProductContextWithMultiply, 'dynamicMetadata'>

export type GetOmniMetadata = (_: OmniMetadataParams) => LendingMetadata | SupplyMetadata

interface ProductContextProviderPropsWithBorrow {
  formDefaults: Partial<OmniBorrowFormState>
  formReducto: typeof useOmniBorrowFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: LendingPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Borrow
}

interface ProductContextProviderPropsWithEarn {
  formDefaults: Partial<OmniEarnFormState>
  formReducto: typeof useOmniEarnFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: SupplyPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Earn
}

interface ProductContextProviderPropsWithMultiply {
  formDefaults: Partial<OmniMultiplyFormState>
  formReducto: typeof useOmniMultiplyFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: LendingPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Multiply
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

interface GenericProductContext<P, F, A, M> {
  form: F
  position: ProductContextPosition<P, A>
  dynamicMetadata: M
}

export type ProductContextWithBorrow = GenericProductContext<
  LendingPosition,
  ReturnType<typeof useOmniBorrowFormReducto>,
  unknown,
  LendingMetadata
>

export type ProductContextWithEarn = GenericProductContext<
  SupplyPosition,
  ReturnType<typeof useOmniEarnFormReducto>,
  unknown,
  SupplyMetadata
>

export type ProductContextWithMultiply = GenericProductContext<
  LendingPosition,
  ReturnType<typeof useOmniMultiplyFormReducto>,
  unknown,
  LendingMetadata
>

const borrowContext = React.createContext<ProductContextWithBorrow | undefined>(undefined)
const earnContext = React.createContext<ProductContextWithEarn | undefined>(undefined)
const multiplyContext = React.createContext<ProductContextWithMultiply | undefined>(undefined)

type PickProductType<T extends OmniProductType> = T extends OmniProductType.Borrow
  ? ProductContextWithBorrow
  : T extends OmniProductType.Earn
  ? ProductContextWithEarn
  : T extends OmniProductType.Multiply
  ? ProductContextWithMultiply
  : never

export function useOmniProductContext<T extends OmniProductType>(
  productType: T,
): PickProductType<T> {
  const { environment } = useOmniGeneralContext()

  const context =
    productType === OmniProductType.Borrow
      ? useContext(borrowContext)
      : productType === OmniProductType.Earn
      ? useContext(earnContext)
      : useContext(multiplyContext)

  if (productType !== environment.productType)
    throw new Error(
      `ProtocolGeneralContext and AjnaProductContext products doesn't match: ${environment.productType}/${productType}`,
    )
  if (!context) throw new Error('AjnaProductContext not available!')
  return context as PickProductType<T>
}

export function OmniProductContextProvider({
  getDynamicMetadata,
  children,
  formDefaults,
  formReducto,
  productType,
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
  // @ts-ignore
  // TODO: find a way to distinguish between the types - there no place for error here except for typescript is too stupid to understand
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

  const initContext = {
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
      setCachedPosition: (positionSet: PositionSet<typeof position>) =>
        setCachedPosition(positionSet),
      setIsLoadingSimulation,
      setSimulation,
      setCachedSwap: (swap: SwapData) => setCachedSwap(swap),
    },
  }

  const [context, setContext] = useState<
    GenericProductContext<
      typeof position,
      typeof form,
      typeof positionAuction,
      LendingMetadata | SupplyMetadata
    >
  >({
    dynamicMetadata: getDynamicMetadata(initContext as OmniMetadataParams),
    ...initContext,
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
    walletAddress,
    positionHistory,
    cachedSwap,
  ])

  switch (productType) {
    case OmniProductType.Borrow:
      return (
        <borrowContext.Provider
          value={
            {
              ...context,
              dynamicMetadata: getDynamicMetadata(context as ProductContextWithBorrow),
            } as ProductContextWithBorrow
          }
        >
          {children}
        </borrowContext.Provider>
      )
    case OmniProductType.Earn:
      return (
        <earnContext.Provider
          value={
            {
              ...context,
              dynamicMetadata: getDynamicMetadata(context as ProductContextWithEarn),
            } as ProductContextWithEarn
          }
        >
          {children}
        </earnContext.Provider>
      )
    case OmniProductType.Multiply:
      return (
        <multiplyContext.Provider
          value={
            {
              ...context,
              dynamicMetadata: getDynamicMetadata(context as ProductContextWithMultiply),
            } as ProductContextWithMultiply
          }
        >
          {children}
        </multiplyContext.Provider>
      )
  }
}

function isAjnaPosition(position: any): position is AjnaPosition {
  return position instanceof AjnaPosition && typeof position.riskRatio === 'object'
}
