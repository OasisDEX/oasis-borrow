import {
  AutomationCommonMetadata,
  defaultMetadata,
} from 'features/automation/common/state/automationMetadata'
import { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'

export interface AutomationConstantMultipleMetadata
  extends AutomationCommonMetadata<ConstantMultipleFormChange> {}

export const defaultConstantMultipleMetadata: AutomationConstantMultipleMetadata = {
  ...defaultMetadata,
}

export const constantMultipleMakerMetadata: AutomationConstantMultipleMetadata = {
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
