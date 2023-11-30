import type { LendingPosition, Strategy, SupplyPosition, SwapData } from '@oasisdex/dma-library'
import { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import type { OmniDupePositionModalProps } from 'features/omni-kit/components'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { formatSwapData } from 'features/omni-kit/protocols/ajna/helpers'
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
import type {
  Dispatch,
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  SetStateAction,
} from 'react'
import React, { useContext, useMemo, useState } from 'react'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

interface OmniFeatureToggles {
  safetySwitch: boolean
  suppressValidation: boolean
}

interface OmniFilters {
  flowStateFilter: (event: CreatePositionEvent) => boolean
}

interface CommonMetadata {
  featureToggles: OmniFeatureToggles
  filters: OmniFilters
  notifications: DetailsSectionNotificationItem[]
  validations: OmniValidations
}

export interface OmniLendingMetadataHandlers {}

export interface OmniSupplyMetadataHandlers {
  txSuccessEarnHandler: () => void
  customReset: () => void
}

interface CommonMetadataValues {
  footerColumns: number
  headlineDetails?: HeadlineDetailsProp[]
  interestRate: BigNumber
  isFormEmpty: boolean
  sidebarTitle: string
}
interface CommonMetadataElements {
  dupeModal: (props: OmniDupePositionModalProps) => ReactElement
  faq: ReactNode
  overviewBanner?: ReactNode
  overviewContent: ReactNode
  overviewFooter: ReactNode
  riskSidebar?: ReactNode
}

export type LendingMetadata = CommonMetadata & {
  handlers?: OmniLendingMetadataHandlers
  values: CommonMetadataValues & {
    afterAvailableToBorrow: BigNumber | undefined
    afterBuyingPower: BigNumber | undefined
    afterPositionDebt: BigNumber | undefined
    changeVariant: 'positive' | 'negative'
    collateralMax: BigNumber
    debtMax: BigNumber
    debtMin: BigNumber
    paybackMax: BigNumber
    shouldShowDynamicLtv: boolean
  }
  elements: CommonMetadataElements & {
    highlighterOrderInformation: ReactNode
  }
}

export type SupplyMetadata = CommonMetadata & {
  handlers: OmniSupplyMetadataHandlers
  values: CommonMetadataValues & {
    earnWithdrawMax: BigNumber
    extraDropdownItems?: SidebarSectionHeaderSelectItem[]
    earnAfterWithdrawMax?: BigNumber
  }
  elements: CommonMetadataElements & {
    earnExtraUiDropdownContent?: ReactNode
    earnFormOrder: ReactNode
    earnFormOrderAsElement: FC<OmniIsCachedPosition>
    extraEarnInput?: ReactNode
    extraEarnInputDeposit?: ReactNode
    extraEarnInputWithdraw?: ReactNode
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

interface PositionSet<Position> {
  position: Position
  simulation?: Position
}

interface OmniValidationMessage {
  name: string
  data?: { [key: string]: string | number }
}

type OmniSimulationData<Position> = Strategy<Position>['simulation'] & {
  errors: OmniValidationMessage[]
  warnings: OmniValidationMessage[]
  notices: OmniValidationMessage[]
  successes: OmniValidationMessage[]
}

interface ProductContextPosition<Position, Auction> {
  cachedPosition?: PositionSet<Position>
  currentPosition: PositionSet<Position>
  swap?: {
    current?: SwapData
    cached?: SwapData
  }
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: (positionSet: PositionSet<OmniGenericPosition>) => void
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<OmniSimulationData<OmniGenericPosition> | undefined>>
  setCachedSwap: (swap: SwapData) => void
  positionAuction: Auction
  history: PositionHistoryEvent[]
  simulationCommon: OmniSimulationCommon
}

interface GenericProductContext<Position, Form, Auction, Metadata> {
  form: Form
  position: ProductContextPosition<Position, Auction>
  dynamicMetadata: Metadata
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
      `OmniGeneralContext and OmniProductContext products doesn't match: ${environment.productType}/${productType}`,
    )
  if (!context) throw new Error('OmniProductContext not available!')
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
  const [simulation, setSimulation] = useState<OmniSimulationData<typeof position>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  // TODO these could be potentially generalized within single hook

  // We need to determine the direction of the swap based on change in position risk
  let isIncreasingPositionRisk = true
  if (isAjnaPosition(simulation?.position) && isAjnaPosition(position) && simulation) {
    isIncreasingPositionRisk = simulation.position.riskRatio.loanToValue.gte(
      position.riskRatio.loanToValue,
    )
  }

  const context = useMemo(() => {
    const fromTokenPrecision = isIncreasingPositionRisk ? quotePrecision : collateralPrecision
    const toTokenPrecision = isIncreasingPositionRisk ? collateralPrecision : quotePrecision

    return {
      form,
      position: {
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
    }
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
