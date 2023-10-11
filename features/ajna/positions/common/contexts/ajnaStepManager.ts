import { ajnaFormExternalSteps, ajnaFormStepsWithTransaction } from 'features/ajna/common/consts'
import type { ProtocolFlow, ProtocolSidebarStep } from 'features/unifiedProtocol/types'

export interface GeneralStepManager {
  currentStep: ProtocolSidebarStep
}

export function isExternalStep({ currentStep }: GeneralStepManager) {
  return ajnaFormExternalSteps.includes(currentStep)
}

export function isNextStep({
  currentStep,
  step,
  steps,
}: GeneralStepManager & { step: ProtocolSidebarStep; steps: ProtocolSidebarStep[] }) {
  return steps.indexOf(step) > steps.indexOf(currentStep)
}

export function isStepWithTransaction({ currentStep }: GeneralStepManager) {
  return ajnaFormStepsWithTransaction.includes(currentStep)
}

export const getAjnaEditingStep = ({ flow }: { flow: ProtocolFlow }) => {
  return flow === 'open' ? 'setup' : 'manage'
}
