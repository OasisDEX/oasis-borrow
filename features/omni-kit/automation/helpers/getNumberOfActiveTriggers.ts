import type { AutomationMetadataFlags } from 'features/omni-kit/types'
import { countBooleanValues } from 'helpers/countBooleanValues'

export const getNumberOfActiveTriggers = ({ flags }: { flags: AutomationMetadataFlags }) => {
  const { trueCount } = countBooleanValues(flags)

  return trueCount
}
