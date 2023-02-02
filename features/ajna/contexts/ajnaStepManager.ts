import { ajnaFormExternalSteps, ajnaFormStepsWithTransaction } from 'features/ajna/common/consts'
import { AjnaStatusStep } from 'features/ajna/common/types'

export interface GeneralStepManager {
  currentStep: AjnaStatusStep
}

export function isExternalStep({ currentStep }: GeneralStepManager) {
  return ajnaFormExternalSteps.includes(currentStep)
}

export function isStepWithTransaction({ currentStep }: GeneralStepManager) {
  return ajnaFormStepsWithTransaction.includes(currentStep)
}
