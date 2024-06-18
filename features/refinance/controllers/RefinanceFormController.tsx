import {
  RefinanceGiveStep,
  RefinanceProductTableStep,
  RefinanceStrategyStep,
  RefinanceWhatsChangingStep,
} from 'features/refinance/components/steps'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { RefinanceFormView } from 'features/refinance/views'
import React from 'react'

export const RefinanceFormController = () => {
  const {
    steps: { currentStep },
  } = useRefinanceContext()

  return (
    <RefinanceFormView>
      {currentStep === RefinanceSidebarStep.Option && <RefinanceStrategyStep />}
      {currentStep === RefinanceSidebarStep.Strategy && <RefinanceProductTableStep />}
      {currentStep === RefinanceSidebarStep.Import && <RefinanceGiveStep />}
      {currentStep === RefinanceSidebarStep.Changes && <RefinanceWhatsChangingStep />}
    </RefinanceFormView>
  )
}
