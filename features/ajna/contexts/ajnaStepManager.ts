import { ajnaFormExternalSteps, ajnaFormStepsWithTransaction } from 'features/ajna/common/consts'
import { AjnaStatusStep } from 'features/ajna/common/types'

export interface GeneralStepManager {
  currentStep: AjnaStatusStep
}

export function isExternalStep({ currentStep }: GeneralStepManager) {
  return ajnaFormExternalSteps.includes(currentStep)
}

export function isNextStep({
  currentStep,
  step,
  steps,
}: GeneralStepManager & { step: AjnaStatusStep, steps: AjnaStatusStep[] }) {
  return steps.indexOf(step) > steps.indexOf(currentStep)
}

export function isStepWithTransaction({ currentStep }: GeneralStepManager) {
  return ajnaFormStepsWithTransaction.includes(currentStep)
}
