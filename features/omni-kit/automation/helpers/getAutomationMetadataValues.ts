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
import type { LendingProtocol } from 'lendingProtocols'

interface GetAutomationMetadataValuesParams {
  automationForms: ProductContextAutomationForms
  commonFormState: OmniAutomationFormState
  hash: string
  poolId?: string
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
  protocol: LendingProtocol
}

export const getAutomationMetadataValues = ({
  automationForms,
  commonFormState,
  hash,
  poolId,
  positionTriggers,
  simulationResponse,
  protocol,
}: GetAutomationMetadataValuesParams) => {
  return {
    ...getMappedAutomationMetadataValues({
      poolId,
      positionTriggers,
      simulationResponse,
      protocol,
    }),
    ...getCommonAutomationMetadataValues({ commonFormState, automationForms, hash }),
  }
}
