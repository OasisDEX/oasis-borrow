import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'

export type AutomationValidationMethodParams<T = {}> = {
  context: ContextWithoutMetadata
} & T
export type AutomationValidationMethodStateResult = boolean | undefined

export interface AutomationMetadataValidationParams<T> {
  gasEstimationUsd?: BigNumber
  state: T
}
export interface AutomationMetadataValidationResult {
  [key: string]: boolean | undefined
}
export type AutomationMetadataValidationMethod<T> = (
  params: AutomationMetadataValidationParams<T>,
) => AutomationMetadataValidationResult

export enum StopLossDetailCards {
  STOP_LOSS_LEVEL = 'STOP_LOSS_LEVEL',
  COLLATERIZATION_RATIO = 'COLLATERIZATION_RATIO',
  DYNAMIC_STOP_PRICE = 'DYNAMIC_STOP_PRICE',
  ESTIMATED_TOKEN_ON_TRIGGER = 'ESTIMATED_TOKEN_ON_TRIGGER',
  LOAN_TO_VALUE = 'LOAN_TO_VALUE',
}

export interface StopLossDetailsConfig {
  stopLossLevelCard?: {
    modalDescription: string
    belowCurrentPositionRatio: string
  }
}

export interface StopLossMetadataDetailCards {
  cardsSet: StopLossDetailCards[]
  cardsConfig?: StopLossDetailsConfig
}

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
  ratioParam: string
  sliderStep: number
  sliderChangeCallback?: (value: BigNumber) => void
  closeToChangeCallback?: (value: string) => void
  initialSlRatioWhenTriggerDoesntExist: BigNumber
  fixedCloseToToken?: string
  validation: {
    getAddErrors: AutomationMetadataValidationMethod<StopLossFormChange>
    getAddWarnings: AutomationMetadataValidationMethod<StopLossFormChange>
    cancelErrors: string[]
    cancelWarnings: string[]
  }
  detailCards?: StopLossMetadataDetailCards
  sliderDirection?: 'ltr' | 'rtl'
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

export interface OverwriteTriggersDefaults {
  stopLossTriggerData?: StopLossTriggerData
  autoBSTriggerData?: AutoBSTriggerData
  autoSellTriggerData?: AutoBSTriggerData
  constantMultipleTriggerData?: ConstantMultipleTriggerData
  autoTakeProfitTriggerData?: AutoTakeProfitTriggerData
}
