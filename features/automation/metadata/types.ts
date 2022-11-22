import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'

export type AutomationValidationMethodStateParams<T = {}> = T
export interface AutomationValidationMethodParams<T = {}> {
  context: ContextWithoutMetadata
  state: AutomationValidationMethodStateParams<T>
}
export type AutomationValidationMethod = (params: AutomationValidationMethodParams) => boolean
export type AutomationValidationSet = [
  AutomationValidationMethod,
  AutomationValidationMethodStateParams?,
]
export type AutomationValidationSetWithGeneric<T> = [
  AutomationValidationMethod,
  AutomationValidationMethodStateParams<T>,
]

export interface StopLossMetadata {
  getWarnings: ({
    state,
    gasEstimationUsd,
  }: {
    state: StopLossFormChange
    gasEstimationUsd?: BigNumber
  }) => VaultWarningMessage[]
  getExecutionPrice: ({ state }: { state: StopLossFormChange }) => BigNumber
  getSliderPercentageFill: ({ state }: { state: StopLossFormChange }) => BigNumber
  getRightBoundary: ({ state }: { state: StopLossFormChange }) => BigNumber
  getMaxToken: ({ state }: { state: StopLossFormChange }) => BigNumber
  sliderMax: BigNumber
  sliderMin: BigNumber
  collateralDuringLiquidation: BigNumber
  triggerMaxToken: BigNumber
  resetData: StopLossResetData
  sliderLeftLabel: string
  withPickCloseTo: boolean
  sliderStep: number
  leftBoundaryFormatter: (value: BigNumber) => string
  sliderChangeCallback?: (value: BigNumber) => void
  closeToChangeCallback?: (value: string) => void
  initialSlRatioWhenTriggerDoesntExist: BigNumber
  validation: {
    getAddErrorValidations: ({ state }: { state: StopLossFormChange }) => AutomationValidationSet[]
  }
}

export interface AutoBSMetadata {}
export interface TakeProfitMetadata {}
export interface ConstantMultipleMetadata {}

export type ContextWithoutMetadata = Omit<AutomationContext, 'metadata'>

export type GetStopLossMetadata = (context: ContextWithoutMetadata) => StopLossMetadata

export type GetTakeProfitMetadata = (context: ContextWithoutMetadata) => TakeProfitMetadata

export type GetAutoBSMetadata = (context: ContextWithoutMetadata) => AutoBSMetadata
export type GetAutoSellOrBuyMetadata = (
  type: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY,
) => GetAutoBSMetadata

export type GetConstantMultipleMetadata = (
  context: ContextWithoutMetadata,
) => ConstantMultipleMetadata

export interface AutomationDefinitionMetadata {
  stopLoss?: GetStopLossMetadata
  autoSell?: GetAutoBSMetadata
  autoBuy?: GetAutoBSMetadata
  constantMultiple?: GetConstantMultipleMetadata
  takeProfit?: GetTakeProfitMetadata
}

export interface AutomationMetadata {
  stopLoss: GetStopLossMetadata
  autoSell: GetAutoBSMetadata
  autoBuy: GetAutoBSMetadata
  constantMultiple: GetConstantMultipleMetadata
  takeProfit: GetTakeProfitMetadata
}
