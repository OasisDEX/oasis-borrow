import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { TxError } from 'helpers/types'

export enum OmniProductType {
  Borrow = 'borrow',
  Earn = 'earn',
  Multiply = 'multiply',
}

export type OmniFlow = 'open' | 'manage'
export type OmniSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction' | 'transition'
export type OmniSidebarEditingStep = Extract<OmniSidebarStep, 'setup' | 'manage'>
export type OmniCloseTo = 'collateral' | 'quote'

export type OmniValidationItem = {
  message: { translationKey?: string; component?: JSX.Element; params?: { [key: string]: string } }
}

export interface OmniIsCachedPosition {
  cached?: boolean
}

export type OmniBorrowPanel = 'collateral' | 'quote' | 'switch' | 'close' | 'adjust'
export type OmniEarnPanel = 'adjust' | 'liquidity' | 'claim-collateral'
export type OmniMultiplyPanel = 'adjust' | 'collateral' | 'quote' | 'switch' | 'close'

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

export interface OmniProductPage {
  collateralToken: string
  networkName: NetworkNames
  positionId?: string
  productType: OmniProductType
  quoteToken: string
}

export type OmniFormState = OmniBorrowFormState | OmniMultiplyFormState | OmniEarnFormState

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

export type OmniGenericPosition = LendingPosition | SupplyPosition

export interface GetOmniBorrowValidationsParams {
  ajnaSafetySwitchOn: boolean
  collateralBalance: BigNumber
  collateralToken: string
  currentStep: OmniSidebarStep
  earnIsFormValid: boolean
  ethBalance: BigNumber
  ethPrice: BigNumber
  flow: OmniFlow
  gasEstimationUsd?: BigNumber
  position: OmniGenericPosition
  positionAuction: AjnaPositionAuction
  productType: OmniProductType
  quoteBalance: BigNumber
  quoteToken: string
  simulationErrors?: OmniSimulationCommon['errors']
  simulationNotices?: OmniSimulationCommon['notices']
  simulationSuccesses?: OmniSimulationCommon['successes']
  simulationWarnings?: OmniSimulationCommon['warnings']
  state: OmniFormState
  txError?: TxError
}

export type OmniSteps = {
  [ProductKey in OmniProductType]: {
    [FlowKey in OmniFlow]: OmniSidebarStep[]
  }
}
