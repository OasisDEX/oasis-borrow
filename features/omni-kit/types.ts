import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import { LendingProtocol } from 'lendingProtocols'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

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

export type OmniSidebarEditingStep = Extract<
  OmniSidebarStep,
  OmniSidebarStep.Setup | OmniSidebarStep.Manage
>

export type OmniSidebarStepsSet = {
  [ProductKey in OmniProductType]: {
    setup: OmniSidebarStep[]
    manage: OmniSidebarStep[]
  }
}

export interface OmniProtocolSettings {
  rawName: string
  steps: OmniSidebarStepsSet
  supportedNetworkIds: OmniSupportedNetworkIds[]
  supportedMainnetNetworkIds: OmniSupportedNetworkIds[]
  supportedProducts: OmniProductType[]
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
  collateralToken?: string
  dpmPositionData?: DpmPositionData
  networkId: OmniSupportedNetworkIds
  product?: OmniProductType
  quoteToken?: string
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
  networkId: OmniSupportedNetworkIds
  positionId?: string
  productType: OmniProductType
  quoteToken: string
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

export interface OmniSimulationCommon {
  errors: { name: string; data?: { [key: string]: string } }[]
  notices: { name: string; data?: { [key: string]: string } }[]
  successes: { name: string; data?: { [key: string]: string } }[]
  warnings: { name: string; data?: { [key: string]: string } }[]
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
  quoteAddress: string
}

export type NetworkIdsWithValues<T> = {
  [key in OmniSupportedNetworkIds]?: T
}
