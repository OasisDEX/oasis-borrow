import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/positions/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
import { AjnaMultiplyFormContentOpen } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentOpen'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormController() {
  const {
    steps: { currentStep },
  } = useAjnaGeneralContext()

  return (
    <AjnaFormView>
      {currentStep === 'risk' && <AjnaFormContentRisk />}
      {currentStep === 'setup' && <AjnaMultiplyFormContentOpen />}
      {currentStep === 'manage' && <>Multiply Manage UI</>}
      {currentStep === 'transaction' && (
        <AjnaFormContentTransaction orderInformation={AjnaMultiplyFormOrder} />
      )}
    </AjnaFormView>
  )
}
