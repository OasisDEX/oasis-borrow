import {
  AutomationEnvironmentData,
  AutomationPositionData,
} from 'components/AutomationContextProvider'
import {
  automationStopLossMakerMetadata,
  AutomationStopLossMetadata,
} from 'features/automation/common/metadata/automationStopLossMetadata'
import { AutomationFeatures } from 'features/automation/common/types'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'

type AutomationMetadataCollection<T> = { [k in VaultProtocol]?: T }

interface AutomationMetadataMap {
  [AutomationFeatures.AUTO_BUY]: unknown
  [AutomationFeatures.AUTO_SELL]: unknown
  [AutomationFeatures.AUTO_TAKE_PROFIT]: unknown
  [AutomationFeatures.CONSTANT_MULTIPLE]: unknown
  [AutomationFeatures.STOP_LOSS]: AutomationStopLossMetadata
}

type AutomationMetadata = {
  [K in AutomationFeatures]: AutomationMetadataCollection<AutomationMetadataMap[K]>
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

export const automationMetadata: AutomationMetadata = {
  [AutomationFeatures.AUTO_BUY]: {},
  [AutomationFeatures.AUTO_SELL]: {},
  [AutomationFeatures.AUTO_TAKE_PROFIT]: {},
  [AutomationFeatures.CONSTANT_MULTIPLE]: {},
  [AutomationFeatures.STOP_LOSS]: {
    [VaultProtocol.Maker]: automationStopLossMakerMetadata,
  },
}
