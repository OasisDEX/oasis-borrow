import {
  AutomationEnvironmentData,
  AutomationPositionData,
} from 'components/AutomationContextProvider'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  autoBuyMakerMetadata,
  AutomationAutoBuyMetadata,
} from 'features/automation/optimization/autoBuy/state/automationAutoBuyMetadata'
import {
  AutomationAutoTakeProfitMetadata,
  autoTakeProfitMakerMetadata,
} from 'features/automation/optimization/autoTakeProfit/state/automationAutoTakeProfitMetadata'
import {
  AutomationConstantMultipleMetadata,
  constantMultipleMakerMetadata,
} from 'features/automation/optimization/constantMultiple/state/automationConstantMultipleMetadata'
import {
  AutomationAutoSellMetadata,
  autoSellMakerMetadata,
} from 'features/automation/protection/autoSell/state/automationAutoSellMetadata'
import {
  AutomationStopLossMetadata,
  stopLossMakerMetadata,
} from 'features/automation/protection/stopLoss/state/automationStopLossMetadata'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'

interface AutomationMetadataMap {
  [AutomationFeatures.AUTO_BUY]: AutomationAutoBuyMetadata
  [AutomationFeatures.AUTO_SELL]: AutomationAutoSellMetadata
  [AutomationFeatures.AUTO_TAKE_PROFIT]: AutomationAutoTakeProfitMetadata
  [AutomationFeatures.CONSTANT_MULTIPLE]: AutomationConstantMultipleMetadata
  [AutomationFeatures.STOP_LOSS]: AutomationStopLossMetadata
}

type AutomationMetadata = {
  [K in AutomationFeatures]: { [L in VaultProtocol]?: AutomationMetadataMap[K] }
}

interface AutomationValidationMethodParams<AutomationState> {
  environmentData: AutomationEnvironmentData
  positionData: AutomationPositionData
  state: AutomationState
}

type AutomationValidationMethod<AutomationState> = (
  params: AutomationValidationMethodParams<AutomationState>,
) => boolean

export interface AutomationCommonMetadata<AutomationState> {
  debtToken: string
  positionLabel: string
  ratioLabel: string
  validation: {
    creationErrors: AutomationValidationMethod<AutomationState>[]
    creationWarnings: AutomationValidationMethod<AutomationState>[]
    cancelErrors: VaultErrorMessage[]
    cancelWarnings: VaultWarningMessage[]
  }
}

export function getAutomationMetadata<T extends AutomationFeatures>(
  feature: AutomationFeatures,
  protocol: VaultProtocol,
) {
  if (automationMetadata[feature][protocol])
    return automationMetadata[feature][protocol] as AutomationMetadataMap[T]
  else throw new UnreachableCaseError(`${feature} in ${protocol}`)
}

export const defaultMetadata = {
  debtToken: '',
  positionLabel: '',
  ratioLabel: '',
  validation: {
    creationErrors: [],
    creationWarnings: [],
    cancelErrors: [],
    cancelWarnings: [],
  },
}

export const automationMetadata: AutomationMetadata = {
  [AutomationFeatures.AUTO_BUY]: {
    [VaultProtocol.Maker]: autoBuyMakerMetadata,
  },
  [AutomationFeatures.AUTO_SELL]: {
    [VaultProtocol.Maker]: autoSellMakerMetadata,
  },
  [AutomationFeatures.AUTO_TAKE_PROFIT]: {
    [VaultProtocol.Maker]: autoTakeProfitMakerMetadata,
  },
  [AutomationFeatures.CONSTANT_MULTIPLE]: {
    [VaultProtocol.Maker]: constantMultipleMakerMetadata,
  },
  [AutomationFeatures.STOP_LOSS]: {
    [VaultProtocol.Maker]: stopLossMakerMetadata,
  },
}
