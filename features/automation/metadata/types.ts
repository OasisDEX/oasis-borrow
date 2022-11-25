import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'

export type ContextWithoutMetadata = Omit<AutomationContext, 'metadata'>

export type GetAutomationMetadata<T> = (context: ContextWithoutMetadata) => T

type AutomationStateValueMethod<T, V = BigNumber> = (state: T) => V
type AutomationCallbackMethod<T> = (params: T) => void

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

export interface AutoBSMetadata {}
export interface AutoTakeProfitMetadata {}
export interface ConstantMultipleMetadata {}
export interface StopLossMetadata {
  callbacks: {
    onCloseToChange?: AutomationCallbackMethod<{ optionName: string }>
    onSliderChange?: AutomationCallbackMethod<{ value: BigNumber }>
  }
  detailCards?: StopLossMetadataDetailCards
  methods: {
    getExecutionPrice: AutomationStateValueMethod<StopLossFormChange>
    getMaxToken: AutomationStateValueMethod<StopLossFormChange>
    getRightBoundary: AutomationStateValueMethod<StopLossFormChange>
    getSliderPercentageFill: AutomationStateValueMethod<StopLossFormChange>
  }
  settings: {
    fixedCloseToToken?: string
    sliderDirection?: 'ltr' | 'rtl'
    sliderStep: number
  }
  translations: {
    ratioParam: string
  }
  validation: {
    getAddErrors: AutomationMetadataValidationMethod<StopLossFormChange>
    getAddWarnings: AutomationMetadataValidationMethod<StopLossFormChange>
    cancelErrors: string[]
    cancelWarnings: string[]
  }
  values: {
    collateralDuringLiquidation: BigNumber
    initialSlRatioWhenTriggerDoesntExist: BigNumber
    resetData: StopLossResetData
    sliderMax: BigNumber
    sliderMin: BigNumber
    triggerMaxToken: BigNumber
  }
}

export interface AutomationMetadata {
  autoBuy: GetAutomationMetadata<AutoBSMetadata>
  autoSell: GetAutomationMetadata<AutoBSMetadata>
  autoTakeProfit: GetAutomationMetadata<AutoTakeProfitMetadata>
  constantMultiple: GetAutomationMetadata<ConstantMultipleMetadata>
  stopLoss: GetAutomationMetadata<StopLossMetadata>
}

export type AutomationDefinitionMetadata = Partial<AutomationMetadata>

export interface OverwriteTriggersDefaults {
  stopLossTriggerData?: StopLossTriggerData
  autoBSTriggerData?: AutoBSTriggerData
  autoSellTriggerData?: AutoBSTriggerData
  constantMultipleTriggerData?: ConstantMultipleTriggerData
  autoTakeProfitTriggerData?: AutoTakeProfitTriggerData
}
