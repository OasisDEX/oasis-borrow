import { AutomationFeatures } from 'features/automation/common/types'
import { AutomationStopLossMetadata } from 'features/automation/metadata/automationStopLossMetadata'
import { VaultProtocol } from 'helpers/getVaultProtocol'

type AutomationMetadataCollection<T> = { [k in VaultProtocol]: T }

interface AutomationMetadata {
  [AutomationFeatures.STOP_LOSS]: AutomationMetadataCollection<AutomationStopLossMetadata>
}

export interface AutomationCommonMetadata {
  debtToken: string
  positionLabel: string
  ratioLabel: string
}

export const automationMetadata: AutomationMetadata = {
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
