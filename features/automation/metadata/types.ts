import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'

export type AutomationValidationMethodStateParams<T = {}> = T
export type AutomationValidationMethodStateReturn = boolean | undefined
export interface AutomationValidationMethodParams<T = {}> {
  context: ContextWithoutMetadata
  state: AutomationValidationMethodStateParams<T>
}
export type AutomationValidationMethod = (
  params: AutomationValidationMethodParams,
) => AutomationValidationMethodStateReturn
export type AutomationValidationSet = [
  AutomationValidationMethod,
  AutomationValidationMethodStateParams?,
]
export type AutomationValidationSetWithGeneric<T> = [
  AutomationValidationMethod,
  AutomationValidationMethodStateParams<T>,
]

export interface StopLossMetadata {
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
    getAddErrors: (props: {
      gasEstimationUsd?: BigNumber
      state: StopLossFormChange
    }) => AutomationValidationSet[]
    getAddWarnings: (props: {
      gasEstimationUsd?: BigNumber
      state: StopLossFormChange
    }) => AutomationValidationSet[]
    cancelErrors: string[]
    cancelWarnings: string[]
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
