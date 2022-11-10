import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import {
  AutomationCommonMetadata,
  defaultMetadata,
} from 'features/automation/common/state/automationMetadata'

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
