import { AutomationFeatures } from 'features/automation/common/types'
import { AutomationStopLossMetadata } from 'features/automation/metadata/automationStopLossMetadata'
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

export interface AutomationCommonMetadata {
  debtToken: string
  positionLabel: string
  ratioLabel: string
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
    [VaultProtocol.Maker]: {
      debtToken: 'DAI',
      positionLabel: 'Vault',
      ratioLabel: 'Collateral ratio',
      foo: 'bar',
    },
    [VaultProtocol.Aave]: {
      debtToken: 'DAI',
      positionLabel: 'Position',
      ratioLabel: 'LTV',
      foo: 'bar',
    },
  },
}
