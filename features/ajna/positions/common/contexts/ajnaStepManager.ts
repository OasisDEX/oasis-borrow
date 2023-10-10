import { ajnaFormExternalSteps, ajnaFormStepsWithTransaction } from 'features/ajna/common/consts'
import type { AjnaFlow, AjnaSidebarStep } from 'features/ajna/common/types'

export interface GeneralStepManager {
  currentStep: AjnaSidebarStep
}

export function isExternalStep({ currentStep }: GeneralStepManager) {
  return ajnaFormExternalSteps.includes(currentStep)
}

export function isNextStep({
  currentStep,
  step,
  steps,
}: GeneralStepManager & { step: AjnaSidebarStep; steps: AjnaSidebarStep[] }) {
  return steps.indexOf(step) > steps.indexOf(currentStep)
}

export function isStepWithTransaction({ currentStep }: GeneralStepManager) {
  return ajnaFormStepsWithTransaction.includes(currentStep)
}

export const getAjnaEditingStep = ({ flow }: { flow: AjnaFlow }) => {
  return flow === 'open' ? 'setup' : 'manage'
}
