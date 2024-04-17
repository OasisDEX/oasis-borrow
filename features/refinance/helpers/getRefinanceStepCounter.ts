import { RefinanceSidebarStep } from 'features/refinance/types'

export const getRefinanceStepCounter = ({ currentStep }: { currentStep: RefinanceSidebarStep }) => {
  switch (currentStep) {
    case RefinanceSidebarStep.Option:
      return '1/5'
    case RefinanceSidebarStep.Strategy:
      return '2/5'
    case RefinanceSidebarStep.Dpm:
      return '3/5'
    case RefinanceSidebarStep.Give:
      return '4/5'
    case RefinanceSidebarStep.Changes:
      return '5/5'
    default:
      return '-'
  }
}
