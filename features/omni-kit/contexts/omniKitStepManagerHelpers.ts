import { OmniKitSidebarStep } from 'features/omni-kit/types'

const externalSteps: OmniKitSidebarStep[] = [OmniKitSidebarStep.Dpm]
const stepsWithTransitions: OmniKitSidebarStep[] = [OmniKitSidebarStep.Transaction]

export const getEditingStep = ({ steps }: { steps: OmniKitSidebarStep[] }) => {
  return steps.includes(OmniKitSidebarStep.Setup)
    ? OmniKitSidebarStep.Setup
    : OmniKitSidebarStep.Manage
}

export function isExternalStep({ currentStep }: { currentStep: OmniKitSidebarStep }) {
  return externalSteps.includes(currentStep)
}

export function isStepWithTransaction({ currentStep }: { currentStep: OmniKitSidebarStep }) {
  return stepsWithTransitions.includes(currentStep)
}
