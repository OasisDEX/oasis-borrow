import { omniFormExternalSteps, omniFormStepsWithTransaction } from 'features/omni-kit/common/consts'
import type { OmniFlow, OmniSidebarStep } from 'features/omni-kit/types/common.types'

export interface OmniGeneralStepManager {
  currentStep: OmniSidebarStep
}

export function isOmniExternalStep({ currentStep }: OmniGeneralStepManager) {
  return omniFormExternalSteps.includes(currentStep)
}

export function isOmniNextStep({
  currentStep,
  step,
  steps,
}: OmniGeneralStepManager & { step: OmniSidebarStep; steps: OmniSidebarStep[] }) {
  return steps.indexOf(step) > steps.indexOf(currentStep)
}

export function isOmniStepWithTransaction({ currentStep }: OmniGeneralStepManager) {
  return omniFormStepsWithTransaction.includes(currentStep)
}

export const getOmniEditingStep = ({ flow }: { flow: OmniFlow }) => {
  return flow === 'open' ? 'setup' : 'manage'
}
