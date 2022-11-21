import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'

export interface StopLossMetadata {
  getWarnings: ({
    state,
    gasEstimationUsd,
  }: {
    state: StopLossFormChange
    gasEstimationUsd?: BigNumber
  }) => VaultWarningMessage[]
  getErrors: ({ state }: { state: StopLossFormChange }) => VaultErrorMessage[]
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
}

export interface AutoBSMetadata {}
export interface TakeProfitMetadata {}
export interface ConstantMultipleMetadata {}

export type GetStopLossMetadata = (context: Omit<AutomationContext, 'metadata'>) => StopLossMetadata

export type GeTakeProfitMetadata = (
  context: Omit<AutomationContext, 'metadata'>,
) => TakeProfitMetadata

export type GetAutoBSMetadata = (context: Omit<AutomationContext, 'metadata'>) => AutoBSMetadata
export type GetAutoSellOrBuyMetadata = (
  type: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY,
) => GetAutoBSMetadata

export type GetConstantMultipleMetadata = (
  context: Omit<AutomationContext, 'metadata'>,
) => ConstantMultipleMetadata

export interface AutomationDefinitionMetadata {
  stopLoss?: GetStopLossMetadata
  autoSell?: GetAutoBSMetadata
  autoBuy?: GetAutoBSMetadata
  constantMultiple?: GetConstantMultipleMetadata
  takeProfit?: GeTakeProfitMetadata
}

export interface AutomationMetadata {
  stopLoss: GetStopLossMetadata
  autoSell: GetAutoBSMetadata
  autoBuy: GetAutoBSMetadata
  constantMultiple: GetConstantMultipleMetadata
  takeProfit: GeTakeProfitMetadata
}
