import BigNumber from 'bignumber.js'
import { AutomationCommonMetadata } from 'features/automation/common/metadata/automationMetadata'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { zero } from 'helpers/zero'

export interface AutomationStopLossMetadata extends AutomationCommonMetadata<StopLossFormChange> {
  getMinSliderBoundry: (liquidationRatio: BigNumber, offset: BigNumber) => BigNumber
  getMaxSliderBoundry: (
    autoSellTriggerData: AutoBSTriggerData,
    constantMultipleTriggerData: ConstantMultipleTriggerData,
    collateralizationRatioAtNextPrice: BigNumber,
    minMaxOffset: BigNumber,
    nextColOffset: BigNumber,
  ) => BigNumber
}

export const automationStopLossDefaultMetadata: AutomationStopLossMetadata = {
  debtToken: '',
  positionLabel: '',
  ratioLabel: '',
  validation: {
    creationErrors: [],
    creationWarnings: [],
    cancelErrors: [],
    cancelWarnings: [],
  },
  getMinSliderBoundry: () => zero,
  getMaxSliderBoundry: () => zero,
}

export const automationStopLossMakerMetadata: AutomationStopLossMetadata = {
  debtToken: 'DAI',
  positionLabel: 'Vault',
  ratioLabel: 'Collateral ratio',
  validation: {
    creationErrors: [],
    creationWarnings: [],
    cancelErrors: [],
    cancelWarnings: [],
  },
  getMinSliderBoundry: (liquidationRatio: BigNumber, offset: BigNumber) => {
    return liquidationRatio.multipliedBy(100).plus(offset)
  },
  getMaxSliderBoundry: (
    autoSellTriggerData: AutoBSTriggerData,
    constantMultipleTriggerData: ConstantMultipleTriggerData,
    collateralizationRatioAtNextPrice: BigNumber,
    minMaxOffset: BigNumber,
    nextColOffset: BigNumber,
  ) => {
    return new BigNumber(
      (autoSellTriggerData.isTriggerEnabled
        ? autoSellTriggerData.execCollRatio.minus(minMaxOffset).div(100)
        : constantMultipleTriggerData.isTriggerEnabled
        ? constantMultipleTriggerData.sellExecutionCollRatio.minus(minMaxOffset).div(100)
        : collateralizationRatioAtNextPrice.minus(nextColOffset.div(100))
      )
        .multipliedBy(100)
        .toFixed(0, BigNumber.ROUND_DOWN),
    )
  },
}
