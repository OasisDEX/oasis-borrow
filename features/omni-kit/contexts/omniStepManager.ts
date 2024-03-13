import { omniFormExternalSteps, omniFormStepsWithTransaction } from 'features/omni-kit/constants'
import { OmniSidebarStep } from 'features/omni-kit/types'
import type { Dispatch, SetStateAction } from 'react'

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

export const getOmniEditingStep = (isOpening: boolean) => {
  return isOpening ? OmniSidebarStep.Setup : OmniSidebarStep.Manage
}

export const shiftOmniStep = <T>({
  direction,
  currentStep,
  steps,
  setCurrentStep,
}: {
  direction: 'next' | 'prev'
  currentStep: T
  steps: T[]
  setCurrentStep: Dispatch<SetStateAction<T>>
}) => {
  const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

  if (steps[i]) setCurrentStep(steps[i])
  else throw new Error(`A step with index ${i} does not exist in form flow.`)
}
