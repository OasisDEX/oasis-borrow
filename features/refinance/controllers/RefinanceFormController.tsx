import {
  RefinanceGiveStep,
  RefinanceProductTableStep,
  RefinanceStrategyStep,
  RefinanceWhatsChangingStep,
} from 'features/refinance/components/steps'
import { useRefinanceContext } from 'features/refinance/contexts'
import type { SDKSimulation } from 'features/refinance/hooks/useSdkSimulation'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { RefinanceFormView } from 'features/refinance/views'
import React from 'react'

export const RefinanceFormController = ({ simulation }: { simulation: SDKSimulation }) => {
  const {
    steps: { currentStep },
  } = useRefinanceContext()

  return (
    <RefinanceFormView>
      {currentStep === RefinanceSidebarStep.Option && <RefinanceStrategyStep />}
      {currentStep === RefinanceSidebarStep.Strategy && <RefinanceProductTableStep />}
      {currentStep === RefinanceSidebarStep.Give && <RefinanceGiveStep />}
      {currentStep === RefinanceSidebarStep.Changes && (
        <RefinanceWhatsChangingStep simulation={simulation} />
      )}
    </RefinanceFormView>
  )
}
