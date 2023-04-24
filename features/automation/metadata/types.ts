import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions'
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

type AutomationCommonMetadata<T> = {
  settings: {
    sliderDirection?: 'ltr' | 'rtl'
    sliderStep: number
  }
  translations: {
    ratioParamTranslationKey: string
    stopLossLevelCardFootnoteKey: string
    bannerStrategiesKey: string
  }
  validation: {
    getAddErrors: AutomationMetadataValidationMethod<T>
    getAddWarnings: AutomationMetadataValidationMethod<T>
    cancelErrors: string[]
    cancelWarnings: string[]
  }
  values: {
    sliderMax: BigNumber
    sliderMin: BigNumber
  }
}

// TODO: add AutomationCommonMetadata types to all metadata features during their implementation
export interface AutoBSMetadata {}
export interface AutoTakeProfitMetadata {}
export interface ConstantMultipleMetadata {}

export interface AutomationContracts {
  addTrigger: AutomationAddTriggerTxDef
  removeTrigger: AutomationRemoveTriggerTxDef
}

export type StopLossMetadata = AutomationCommonMetadata<StopLossFormChange> & {
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
    prepareAddStopLossTriggerData: (stopLossState: StopLossFormChange) => AutomationAddTriggerData
  }
  settings: {
    fixedCloseToToken?: string
  }
  values: {
    collateralDuringLiquidation: BigNumber
    initialSlRatioWhenTriggerDoesntExist: BigNumber
    resetData: StopLossResetData
    triggerMaxToken: BigNumber
    dynamicStopLossPrice: BigNumber
    removeTxData: AutomationRemoveTriggerData
  }
  contracts: AutomationContracts
  stopLossWriteEnabled: boolean
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
