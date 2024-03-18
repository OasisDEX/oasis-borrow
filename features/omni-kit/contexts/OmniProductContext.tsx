import type { LendingPosition, Strategy, SupplyPosition, SwapData } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { AutomationFeatures } from 'features/automation/common/types'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniValidations } from 'features/omni-kit/helpers'
import { formatSwapData } from 'features/omni-kit/protocols/ajna/helpers'
import {
  getAutomationAutoBSFormDefaults,
  useOmniAutomationAutoBSFormReducto,
} from 'features/omni-kit/state/automation/auto-bs'
import type {
  OmniAutomationFormState,
  useOmniAutomationFormReducto,
} from 'features/omni-kit/state/automation/common'
import {
  getAutomationPartialTakeProfitFormDefaults,
  useOmniAutomationPartialTakeProfitFormReducto,
} from 'features/omni-kit/state/automation/partial-take-profit'
import {
  getAutomationStopLossFormDefaults,
  useOmniStopLossAutomationFormReducto,
} from 'features/omni-kit/state/automation/stop-loss'
import {
  getAutomationTrailingStopLossFormDefaults,
  useOmniAutomationTrailingStopLossFormReducto,
} from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { OmniBorrowFormState, useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState, useOmniEarnFormReducto } from 'features/omni-kit/state/earn'
import type {
  OmniMultiplyFormState,
  useOmniMultiplyFormReducto,
} from 'features/omni-kit/state/multiply'
import type {
  OmniGenericPosition,
  OmniSimulationCommon,
  OmniValidations,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { useObservable } from 'helpers/observableHook'
import type {
  AutoBuyTriggersWithDecodedParams,
  AutoSellTriggersWithDecodedParams,
  GetTriggersResponse,
  PartialTakeProfitTriggers,
  PartialTakeProfitTriggersWithDecodedParams,
  SetupBasicAutoResponse,
  SetupBasicStopLossResponse,
  SetupPartialTakeProfitResponse,
  SetupTrailingStopLossResponse,
  StopLossTriggersWithDecodedParams,
  TrailingStopLossTriggersWithDecodedParams,
} from 'helpers/triggers'
import { useAccount } from 'helpers/useAccount'
import type { Dispatch, FC, PropsWithChildren, ReactNode, SetStateAction } from 'react'
import React, { useContext, useMemo, useState } from 'react'
import type { Theme } from 'theme-ui'
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
  txSuccessEarnHandler?: () => void
  customReset?: () => void
}

export interface AutomationMetadataValues {
  flags: {
    isStopLossEnabled: boolean
    isTrailingStopLossEnabled: boolean
    isAutoSellEnabled: boolean
    isAutoBuyEnabled: boolean
    isPartialTakeProfitEnabled: boolean
  }
  triggers: {
    [AutomationFeatures.STOP_LOSS]?: StopLossTriggersWithDecodedParams
    [AutomationFeatures.TRAILING_STOP_LOSS]?: TrailingStopLossTriggersWithDecodedParams
    [AutomationFeatures.AUTO_SELL]?: AutoSellTriggersWithDecodedParams
    [AutomationFeatures.AUTO_BUY]?: AutoBuyTriggersWithDecodedParams
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]?: PartialTakeProfitTriggersWithDecodedParams
    [AutomationFeatures.CONSTANT_MULTIPLE]?: PartialTakeProfitTriggers
    [AutomationFeatures.AUTO_TAKE_PROFIT]?: PartialTakeProfitTriggers
  }
  simulation: AutomationMetadataValuesSimulation
}

interface CommonMetadataValues {
  footerColumns: number
  headline?: string
  headlineDetails?: HeadlineDetailsProp[]
  isHeadlineDetailsLoading?: boolean
  interestRate: BigNumber
  isFormEmpty: boolean
  sidebarTitle?: string
  automation?: AutomationMetadataValues
}
interface CommonMetadataElements {
  faq: ReactNode
  overviewBanner?: ReactNode
  overviewContent: ReactNode
  overviewFooter: ReactNode
  overviewWithSimulation?: boolean
  sidebarContent?: ReactNode
  riskSidebar?: ReactNode
}

export type ShouldShowDynamicLtvMetadata = (params: { includeCache: boolean }) => boolean

export type LendingMetadata = CommonMetadata & {
  handlers?: OmniLendingMetadataHandlers
  values: CommonMetadataValues & {
    afterAvailableToBorrow: BigNumber | undefined
    afterBuyingPower: BigNumber | undefined
    afterPositionDebt: BigNumber | undefined
    changeVariant: 'positive' | 'negative'
    withdrawMax: BigNumber
    debtMax: BigNumber
    debtMin: BigNumber
    paybackMax: BigNumber
    shouldShowDynamicLtv: ShouldShowDynamicLtvMetadata
    maxSliderAsMaxLtv?: boolean
  }
  elements: CommonMetadataElements & {
    highlighterOrderInformation?: ReactNode
  }
  theme?: Theme
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
    earnFormOrderAsElement: FC
    extraEarnInput?: ReactNode
    extraEarnInputDeposit?: ReactNode
    extraEarnInputWithdraw?: ReactNode
  }
  theme?: Theme
}

export type OmniMetadataParams =
  | Omit<ProductContextWithBorrow, 'dynamicMetadata'>
  | Omit<ProductContextWithEarn, 'dynamicMetadata'>
  | Omit<ProductContextWithMultiply, 'dynamicMetadata'>

export type GetOmniMetadata = (_: OmniMetadataParams) => LendingMetadata | SupplyMetadata

interface WithAutomation {
  automationFormReducto: typeof useOmniAutomationFormReducto
  automationFormDefaults: Partial<OmniAutomationFormState>
  positionTriggers: GetTriggersResponse
}

interface ProductContextProviderPropsWithBorrow extends WithAutomation {
  formDefaults: Partial<OmniBorrowFormState>
  formReducto: typeof useOmniBorrowFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: LendingPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Borrow
}

interface ProductContextProviderPropsWithEarn extends WithAutomation {
  formDefaults: Partial<OmniEarnFormState>
  formReducto: typeof useOmniEarnFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: SupplyPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Earn
}

interface ProductContextProviderPropsWithMultiply extends WithAutomation {
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

export type OmniSimulationData<Position> = Strategy<Position>['simulation'] & {
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

export type OmniAutomationSimulationResponse =
  | SetupBasicAutoResponse
  | SetupBasicStopLossResponse
  | SetupTrailingStopLossResponse
  | SetupPartialTakeProfitResponse

type AutomationMetadataValuesSimulation = OmniAutomationSimulationResponse['simulation']

interface ProductContextAutomation {
  positionTriggers: GetTriggersResponse
  automationForms: {
    stopLoss: ReturnType<typeof useOmniStopLossAutomationFormReducto>
    trailingStopLoss: ReturnType<typeof useOmniAutomationTrailingStopLossFormReducto>
    autoSell: ReturnType<typeof useOmniAutomationAutoBSFormReducto>
    autoBuy: ReturnType<typeof useOmniAutomationAutoBSFormReducto>
    partialTakeProfit: ReturnType<typeof useOmniAutomationPartialTakeProfitFormReducto>
    autoTakeProfit: ReturnType<typeof useOmniAutomationPartialTakeProfitFormReducto>
    constantMultiple: ReturnType<typeof useOmniAutomationPartialTakeProfitFormReducto>
  }
  commonForm: ReturnType<typeof useOmniAutomationFormReducto>
  simulationData?: OmniAutomationSimulationResponse
  isSimulationLoading?: boolean
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<OmniAutomationSimulationResponse | undefined>>
}

interface GenericProductContext<Position, Form, Auction, Metadata> {
  form: Form
  position: ProductContextPosition<Position, Auction>
  dynamicMetadata: Metadata
  automation: ProductContextAutomation
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
  automationFormReducto,
  automationFormDefaults,
  productType,
  position,
  positionAuction,
  positionHistory,
  positionTriggers,
}: PropsWithChildren<ProductDetailsContextProviderProps>) {
  const { walletAddress } = useAccount()
  const { positionIdFromDpmProxy$ } = useProductContext()

  const {
    environment: {
      collateralBalance,
      collateralPrecision,
      collateralToken,
      ethBalance,
      ethPrice,
      quoteBalance,
      quotePrecision,
      quoteToken,
      isOpening,
      gasEstimation,
      entryToken,
      protocol,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()
  // @ts-ignore
  // TODO: find a way to distinguish between the types - there no place for error here except for typescript is too stupid to understand
  const form = formReducto(formDefaults)

  const automationForm = automationFormReducto(automationFormDefaults)
  const stopLossForm = useOmniStopLossAutomationFormReducto(
    getAutomationStopLossFormDefaults(positionTriggers),
  )
  const trailingStopLossForm = useOmniAutomationTrailingStopLossFormReducto(
    getAutomationTrailingStopLossFormDefaults(positionTriggers),
  )
  const autoSellForm = useOmniAutomationAutoBSFormReducto(
    getAutomationAutoBSFormDefaults(positionTriggers, AutomationFeatures.AUTO_SELL),
  )
  const autoBuyForm = useOmniAutomationAutoBSFormReducto(
    getAutomationAutoBSFormDefaults(positionTriggers, AutomationFeatures.AUTO_BUY),
  )
  const partialTakeProfitForm = useOmniAutomationPartialTakeProfitFormReducto(
    getAutomationPartialTakeProfitFormDefaults(positionTriggers),
  )

  const automationForms = {
    stopLoss: stopLossForm,
    trailingStopLoss: trailingStopLossForm,
    autoSell: autoSellForm,
    autoBuy: autoBuyForm,
    partialTakeProfit: partialTakeProfitForm,
    constantMultiple: partialTakeProfitForm,
    autoTakeProfit: partialTakeProfitForm,
  }

  const { state } = form
  const { state: automationState } = automationForm

  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(state.dpmAddress), [state.dpmAddress]),
  )

  // TODO these could be potentially generalized within single hook
  const [cachedPosition, setCachedPosition] = useState<PositionSet<typeof position>>()
  const [cachedSwap, setCachedSwap] = useState<SwapData>()
  const [simulation, setSimulation] = useState<OmniSimulationData<typeof position>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  // TODO these could be potentially generalized within single hook

  const [automationSimulationData, setAutomationSimulationData] =
    useState<OmniAutomationSimulationResponse>()
  const [isAutomationSimulationLoading, setAutomationIsLoadingSimulation] = useState(false)

  // We need to determine the direction of the swap based on change in position risk
  let isIncreasingPositionRisk = true
  if (simulation && 'riskRatio' in simulation.position && 'riskRatio' in position) {
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
          getValidations: getOmniValidations({
            collateralBalance: entryToken.balance,
            collateralToken,
            currentStep,
            ethBalance,
            ethPrice,
            gasEstimationUsd: gasEstimation?.usdValue,
            isOpening,
            position,
            productType,
            quoteBalance,
            quoteToken,
            protocol,
            simulationErrors: simulation?.errors as OmniSimulationCommon['errors'],
            simulationWarnings: simulation?.warnings as OmniSimulationCommon['warnings'],
            simulationNotices: simulation?.notices as OmniSimulationCommon['notices'],
            simulationSuccesses: simulation?.successes as OmniSimulationCommon['successes'],
            state,
          }),
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
      automation: {
        positionTriggers,
        automationForms,
        commonForm: automationForm,
        simulationData: automationSimulationData,
        isSimulationLoading: isAutomationSimulationLoading,
        setIsLoadingSimulation: setAutomationIsLoadingSimulation,
        setSimulation: setAutomationSimulationData,
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
    positionTriggers,
    automationState,
    automationForms,
    automationSimulationData,
    isAutomationSimulationLoading,
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
