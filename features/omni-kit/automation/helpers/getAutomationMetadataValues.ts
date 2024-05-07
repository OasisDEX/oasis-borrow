import {
  getCommonAutomationMetadataValues,
  getMappedAutomationMetadataValues,
} from 'features/omni-kit/automation/helpers'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common'
import type {
  OmniAutomationSimulationResponse,
  ProductContextAutomationForms,
} from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'

interface GetAutomationMetadataValuesParams {
  automationForms: ProductContextAutomationForms
  commonFormState: OmniAutomationFormState
  hash: string
  poolId?: string
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
}

export const getAutomationMetadataValues = ({
  automationForms,
  commonFormState,
  hash,
  poolId,
  positionTriggers,
  simulationResponse,
}: GetAutomationMetadataValuesParams) => {
  return {
    ...getMappedAutomationMetadataValues({ poolId, positionTriggers, simulationResponse }),
    ...getCommonAutomationMetadataValues({ commonFormState, automationForms, hash }),
  }
}
