import {
  AutomationCommonMetadata,
  defaultMetadata,
} from 'features/automation/common/state/automationMetadata'
import { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'

export interface AutomationAutoTakeProfitMetadata
  extends AutomationCommonMetadata<AutoTakeProfitFormChange> {}

export const defaultAutoTakeProfitMetadata: AutomationAutoTakeProfitMetadata = {
  ...defaultMetadata,
}

export const autoTakeProfitMakerMetadata: AutomationAutoTakeProfitMetadata = {
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
