import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { defaultMetadata } from 'features/automation/common/state/automationDefaultMetadata'
import { AutomationCommonMetadata } from 'features/automation/common/state/automationMetadata'

export interface AutomationAutoBuyMetadata extends AutomationCommonMetadata<AutoBSFormChange> {}

export const defaultAutoBuyMetadata: AutomationAutoBuyMetadata = {
  ...defaultMetadata,
}

export const autoBuyMakerMetadata: AutomationAutoBuyMetadata = {
  debtToken: 'DAI',
  positionLabel: 'Vault',
  ratioLabel: 'Collateral ratio',
  validation: {
    creationErrors: [],
    creationWarnings: [],
    cancelErrors: [],
    cancelWarnings: [],
  },
}
