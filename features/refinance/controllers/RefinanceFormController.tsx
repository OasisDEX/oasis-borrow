import {
  // RefinanceStrategyStep,
  // RefinanceWhatsChangingStep,
  RefinanceTransactionStep,
} from 'features/refinance/components/steps'
import { RefinanceFormView } from 'features/refinance/views'
import React from 'react'

export const RefinanceFormController = () => {
  return (
    <RefinanceFormView>
      {/*<RefinanceStrategyStep />*/}
      {/*<RefinanceWhatsChangingStep />*/}
      <RefinanceTransactionStep />
    </RefinanceFormView>
  )
}
