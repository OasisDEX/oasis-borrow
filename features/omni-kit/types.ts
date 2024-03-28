import type {
  LendingPosition,
  Strategy,
  SupplyPosition,
  Swap,
  SwapData,
} from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { ItemProps } from 'components/infoSection/Item'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import type { AutomationFeatures } from 'features/automation/common/types'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { useOmniAutomationAutoBSFormReducto } from 'features/omni-kit/state/automation/auto-bs'
import type {
  OmniAutomationFormState,
  useOmniAutomationFormReducto,
} from 'features/omni-kit/state/automation/common'
import type { useOmniAutomationPartialTakeProfitFormReducto } from 'features/omni-kit/state/automation/partial-take-profit'
import type { useOmniStopLossAutomationFormReducto } from 'features/omni-kit/state/automation/stop-loss'
import type { useOmniAutomationTrailingStopLossFormReducto } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { OmniBorrowFormState, useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState, useOmniEarnFormReducto } from 'features/omni-kit/state/earn'
import type {
  OmniMultiplyFormState,
  useOmniMultiplyFormReducto,
} from 'features/omni-kit/state/multiply'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
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
import type { TxError } from 'helpers/types'
import type { LendingProtocolLabel } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react'
import type { Theme } from 'theme-ui'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

const omniSupportedNetworkIds = [
  NetworkIds.ARBITRUMMAINNET,
  NetworkIds.BASEMAINNET,
  NetworkIds.GOERLI,
  NetworkIds.MAINNET,
  NetworkIds.OPTIMISMMAINNET,
] as const

export type OmniSupportedNetworkIds = (typeof omniSupportedNetworkIds)[number]

const omniSupportedProtocols = [
  LendingProtocol.Ajna,
  LendingProtocol.MorphoBlue,
  LendingProtocol.AaveV2,
  LendingProtocol.AaveV3,
  LendingProtocol.SparkV3,
] as const

export type OmniSupportedProtocols = (typeof omniSupportedProtocols)[number]

export type OmniGenericPosition = LendingPosition | SupplyPosition

export enum OmniProductType {
  Borrow = 'borrow',
  Earn = 'earn',
  Multiply = 'multiply',
}

export type OmniProductBorrowishType = OmniProductType.Borrow | OmniProductType.Multiply

export enum OmniSidebarStep {
  Dpm = 'dpm',
  Manage = 'manage',
  Risk = 'risk',
  Setup = 'setup',
  Transaction = 'transaction',
  Transition = 'transition',
}

export enum OmniSidebarAutomationStep {
  Manage = 'manage',
  Transaction = 'transaction',
}

export type OmniSidebarEditingStep = Extract<
  OmniSidebarStep,
  OmniSidebarStep.Setup | OmniSidebarStep.Manage
>

export type OmniSidebarAutomationEditingStep = Extract<
  OmniSidebarAutomationStep,
  OmniSidebarAutomationStep.Manage
>

export type OmniSidebarStepsSet = {
  [ProductKey in OmniProductType]: {
    setup: OmniSidebarStep[]
    manage: OmniSidebarStep[]
  }
}

export interface OmniProtocolSettings {
  entryTokens?: NetworkIdsWithValues<{ [pair: string]: string }>
  pullTokens?: NetworkIdsWithValues<string[]>
  rawName: NetworkIdsWithValues<string>
  returnTokens?: NetworkIdsWithValues<string[]>
  steps: OmniSidebarStepsSet
  supportedMainnetNetworkIds: OmniSupportedNetworkIds[]
  supportedMultiplyTokens: NetworkIdsWithValues<string[]>
  supportedNetworkIds: OmniSupportedNetworkIds[]
  supportedProducts: OmniProductType[]
  yieldLoopPairsWithData?: NetworkIdsWithValues<string[]>
  availableAutomations: NetworkIdsWithValues<AutomationFeatures[]>
}

export type OmniProtocolsSettings = {
  [key in OmniSupportedProtocols]: OmniProtocolSettings
}

export interface OmniTokensPrecision {
  collateralDigits: number
  collateralPrecision: number
  quoteDigits: number
  quotePrecision: number
}

export interface OmniProtocolHookProps {
  collateralToken: string
  dpmPositionData?: DpmPositionData
  label?: string
  networkId: OmniSupportedNetworkIds
  product?: OmniProductType
  protocol: OmniSupportedProtocols
  quoteToken: string
  tokenPriceUSDData?: Tickers
  tokensPrecision?: OmniTokensPrecision
}

export type OmniCloseTo = 'collateral' | 'quote'

export enum OmniSidebarBorrowPanel {
  Adjust = 'adjust',
  Close = 'close',
  Collateral = 'collateral',
  Quote = 'quote',
  Switch = 'switch',
}

export enum OmniSidebarEarnPanel {
  Adjust = 'adjust',
  ClaimCollateral = 'claimCollateral',
  Liquidity = 'liquidity',
}

export enum OmniMultiplyPanel {
  Adjust = 'adjust',
  Close = 'close',
  Collateral = 'collateral',
  Quote = 'quote',
  Switch = 'switch',
}

export enum OmniBorrowFormAction {
  AdjustBorrow = 'adjustBorrow',
  CloseBorrow = 'closeBorrow',
  DepositBorrow = 'depositBorrow',
  GenerateBorrow = 'generateBorrow',
  OpenBorrow = 'openBorrow',
  PaybackBorrow = 'paybackBorrow',
  SwitchBorrow = 'switchBorrow',
  WithdrawBorrow = 'withdrawBorrow',
}

export enum OmniEarnFormAction {
  OpenEarn = 'openEarn',
  DepositEarn = 'depositEarn',
  WithdrawEarn = 'withdrawEarn',
  ClaimEarn = 'claimEarn',
}

export enum OmniMultiplyFormAction {
  OpenMultiply = 'openMultiply',
  AdjustMultiply = 'adjustMultiply',
  DepositCollateralMultiply = 'depositCollateralMultiply',
  DepositQuoteMultiply = 'depositQuoteMultiply',
  GenerateMultiply = 'denerateMultiply',
  PaybackMultiply = 'paybackMultiply',
  WithdrawMultiply = 'withdrawMultiply',
  SwitchMultiply = 'switchMultiply',
  CloseMultiply = 'closeMultiply',
}

export type OmniFormAction = OmniBorrowFormAction | OmniEarnFormAction | OmniMultiplyFormAction
export type OmniFormState = OmniBorrowFormState | OmniMultiplyFormState | OmniEarnFormState
export interface OmniProductPage {
  collateralToken: string
  label?: string
  networkId: OmniSupportedNetworkIds
  positionId?: string
  productType: OmniProductType
  protocol: OmniSupportedProtocols
  quoteToken: string
  version?: string
}

export type OmniValidations = {
  errors: OmniValidationItem[]
  hasErrors: boolean
  isFormFrozen: boolean
  isFormValid: boolean
  notices: OmniValidationItem[]
  successes: OmniValidationItem[]
  warnings: OmniValidationItem[]
}

export type OmniPartialValidations = {
  localErrors: OmniValidationItem[]
  localWarnings: OmniValidationItem[]
}

export interface OmniSimulationCommon {
  errors: { name: string; data?: { [key: string]: string } }[]
  notices: { name: string; data?: { [key: string]: string } }[]
  successes: { name: string; data?: { [key: string]: string } }[]
  warnings: { name: string; data?: { [key: string]: string } }[]
  getValidations: (params: GetOmniValidationResolverParams) => OmniValidations
}

export type OmniSimulationSwap = Swap &
  SwapData & {
    fromTokenAmountRaw: BigNumber
    minToTokenAmountRaw: BigNumber
    toTokenAmountRaw: BigNumber
  }

export interface OmniValidationItem {
  message: { translationKey?: string; component?: JSX.Element; params?: { [key: string]: string } }
}

export interface OmniFormDefaults {
  borrow: Partial<OmniBorrowFormState>
  earn: Partial<OmniEarnFormState>
  multiply: Partial<OmniMultiplyFormState>
}

export interface OmniFlowStateFilterParams {
  collateralAddress: string
  event: CreatePositionEvent
  productType: OmniProductType
  protocol: LendingProtocol
  protocolRaw?: string
  quoteAddress: string
}

export type NetworkIdsWithValues<T> = {
  [key in OmniSupportedNetworkIds]?: T
}

type SimulationValidations = { name: string; data?: { [key: string]: string } }[]

export interface GetOmniValidationsParams {
  collateralBalance: BigNumber
  collateralToken: string
  currentStep: OmniSidebarStep
  customErrors?: OmniValidationItem[]
  customWarnings?: OmniValidationItem[]
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  isOpening: boolean
  position: OmniGenericPosition
  simulation?: OmniGenericPosition
  productType: OmniProductType
  protocol: LendingProtocol
  quoteBalance: BigNumber
  quoteToken: string
  simulationErrors?: SimulationValidations
  simulationNotices?: SimulationValidations
  simulationSuccesses?: SimulationValidations
  simulationWarnings?: SimulationValidations
  state: OmniFormState
  positionTriggers: GetTriggersResponse
  txError?: TxError
}

export interface GetOmniValidationResolverParams {
  customErrors?: OmniValidationItem[]
  customNotices?: OmniValidationItem[]
  customSuccesses?: OmniValidationItem[]
  customWarnings?: OmniValidationItem[]
  earnIsFormValid?: boolean
  isFormFrozen: boolean
  protocolLabel: LendingProtocolLabel
  safetySwitchOn: boolean
}

export type OmniNotificationCallbackWithParams<P> = (params: P) => DetailsSectionNotificationItem

export type OmniEntryToken = {
  address: string
  balance: BigNumber
  digits: number
  icon: string
  precision: number
  price: BigNumber
  symbol: string
}

export interface OmniSwapToken {
  address: string
  balance: BigNumber
  digits: number
  precision: number
  price: BigNumber
  token: string
}

export interface OmniExtraTokenData {
  [key: string]: {
    balance: BigNumber
    price: BigNumber
  }
}

interface OmniFeatureToggles {
  safetySwitch: boolean
  suppressValidation: boolean
}

interface OmniFilters {
  flowStateFilter: (event: CreatePositionEvent) => Promise<boolean>
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
  resolved: {
    activeUiDropdown: AutomationFeatures
    activeForm: ProductContextAutomationForm
    isProtection: boolean
    isOptimization: boolean
    isFormEmpty: boolean
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
  positionBanner?: ReactNode
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
    earnAfterWithdrawMax?: BigNumber
    earnWithdrawMax: BigNumber
    extraDropdownItems?: SidebarSectionHeaderSelectItem[]
    withAdjust?: boolean
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

export interface WithAutomation {
  automationFormReducto: typeof useOmniAutomationFormReducto
  automationFormDefaults: Partial<OmniAutomationFormState>
  positionTriggers: GetTriggersResponse
}

export interface ProductContextProviderPropsWithBorrow extends WithAutomation {
  formDefaults: Partial<OmniBorrowFormState>
  formReducto: typeof useOmniBorrowFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: LendingPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Borrow
}

export interface ProductContextProviderPropsWithEarn extends WithAutomation {
  formDefaults: Partial<OmniEarnFormState>
  formReducto: typeof useOmniEarnFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: SupplyPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Earn
}

export interface ProductContextProviderPropsWithMultiply extends WithAutomation {
  formDefaults: Partial<OmniMultiplyFormState>
  formReducto: typeof useOmniMultiplyFormReducto
  getDynamicMetadata: GetOmniMetadata
  position: LendingPosition
  positionAuction: unknown
  positionHistory: PositionHistoryEvent[]
  productType: OmniProductType.Multiply
}

export type ProductDetailsContextProviderProps =
  | ProductContextProviderPropsWithBorrow
  | ProductContextProviderPropsWithEarn
  | ProductContextProviderPropsWithMultiply

export interface OmniPositionSet<Position> {
  position: Position
  simulation?: Position
}

export interface OmniValidationMessage {
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
  cachedPosition?: OmniPositionSet<Position>
  currentPosition: OmniPositionSet<Position>
  swap?: {
    current?: OmniSimulationSwap
    cached?: OmniSimulationSwap
  }
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: (positionSet: OmniPositionSet<OmniGenericPosition>) => void
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<OmniSimulationData<OmniGenericPosition> | undefined>>
  setCachedSwap: (swap: OmniSimulationSwap) => void
  positionAuction: Auction
  history: PositionHistoryEvent[]
  simulationCommon: OmniSimulationCommon
}

export type OmniAutomationSimulationResponse =
  | SetupBasicAutoResponse
  | SetupBasicStopLossResponse
  | SetupTrailingStopLossResponse
  | SetupPartialTakeProfitResponse

export type AutomationMetadataValuesSimulation = OmniAutomationSimulationResponse['simulation']

export interface ProductContextAutomationForms {
  stopLoss: ReturnType<typeof useOmniStopLossAutomationFormReducto>
  trailingStopLoss: ReturnType<typeof useOmniAutomationTrailingStopLossFormReducto>
  autoSell: ReturnType<typeof useOmniAutomationAutoBSFormReducto>
  autoBuy: ReturnType<typeof useOmniAutomationAutoBSFormReducto>
  partialTakeProfit: ReturnType<typeof useOmniAutomationPartialTakeProfitFormReducto>
  autoTakeProfit: ReturnType<typeof useOmniAutomationPartialTakeProfitFormReducto>
  constantMultiple: ReturnType<typeof useOmniAutomationPartialTakeProfitFormReducto>
}

export type ProductContextAutomationForm =
  ProductContextAutomationForms[keyof ProductContextAutomationForms]

export interface ProductContextAutomation {
  positionTriggers: GetTriggersResponse
  automationForms: ProductContextAutomationForms
  commonForm: ReturnType<typeof useOmniAutomationFormReducto>
  simulationData?: OmniAutomationSimulationResponse
  isSimulationLoading?: boolean
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<OmniAutomationSimulationResponse | undefined>>
  cachedOrderInfoItems?: ItemProps[]
  setCachedOrderInfoItems: Dispatch<SetStateAction<ItemProps[] | undefined>>
}

export interface GenericProductContext<Position, Form, Auction, Metadata> {
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
