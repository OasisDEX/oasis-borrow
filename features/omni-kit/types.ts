import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { TxError } from 'helpers/types'

export type OmniProduct = 'borrow' | 'earn' | 'multiply'
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

export type OmniBorrowAction =
  | 'open-borrow'
  | 'deposit-borrow'
  | 'withdraw-borrow'
  | 'generate-borrow'
  | 'payback-borrow'
  | 'switch-borrow'
  | 'close-borrow'
  | 'adjust-borrow'

export type OmniEarnAction = 'open-earn' | 'deposit-earn' | 'withdraw-earn' | 'claim-earn'

export type OmniMultiplyAction =
  | 'open-multiply'
  | 'adjust'
  | 'deposit-collateral-multiply'
  | 'deposit-quote-multiply'
  | 'generate-multiply'
  | 'payback-multiply'
  | 'withdraw-multiply'
  | 'switch-multiply'
  | 'close-multiply'

export interface OmniProductPage {
  collateralToken: string
  positionId?: string
  networkName: NetworkNames
  productType: OmniProduct
  quoteToken: string
}

export type OmniFormAction = OmniBorrowAction | OmniEarnAction | OmniMultiplyAction

export type OmniFormState = OmniBorrowFormState | OmniMultiplyFormState | OmniEarnFormState

export type OmniValidations = {
  isFormValid: boolean
  isFormFrozen: boolean
  hasErrors: boolean
  errors: OmniValidationItem[]
  warnings: OmniValidationItem[]
  notices: OmniValidationItem[]
  successes: OmniValidationItem[]
}

export interface OmniSimulationCommon {
  errors: { name: string; data?: { [key: string]: string } }[]
  warnings: { name: string; data?: { [key: string]: string } }[]
  successes: { name: string; data?: { [key: string]: string } }[]
  notices: { name: string; data?: { [key: string]: string } }[]
}

export type OmniGenericPosition = LendingPosition | SupplyPosition

export interface GetOmniBorrowValidationsParams {
  ajnaSafetySwitchOn: boolean
  flow: OmniFlow
  collateralBalance: BigNumber
  collateralToken: string
  quoteToken: string
  currentStep: OmniSidebarStep
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  product: OmniProduct
  quoteBalance: BigNumber
  simulationErrors?: OmniSimulationCommon['errors']
  simulationWarnings?: OmniSimulationCommon['warnings']
  simulationNotices?: OmniSimulationCommon['notices']
  simulationSuccesses?: OmniSimulationCommon['successes']
  state: OmniFormState
  position: OmniGenericPosition
  positionAuction: AjnaPositionAuction
  txError?: TxError
  earnIsFormValid: boolean
}

export type OmniSteps = {
  [ProductKey in OmniProduct]: {
    [FlowKey in OmniFlow]: OmniSidebarStep[]
  }
}
