import {
  RefinanceGiveStep,
  RefinanceProductTableStep,
  RefinanceStrategyStep,
  RefinanceTransactionStep,
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
      {currentStep === RefinanceSidebarStep.Give && <RefinanceGiveStep />}
      {currentStep === RefinanceSidebarStep.Changes && <RefinanceWhatsChangingStep />}
      {currentStep === RefinanceSidebarStep.Transaction && <RefinanceTransactionStep />}
    </RefinanceFormView>
  )
}
