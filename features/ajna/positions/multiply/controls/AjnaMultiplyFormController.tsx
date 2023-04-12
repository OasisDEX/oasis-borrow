import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
import { AjnaMultiplyFormContentOpen } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentOpen'
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
        <>Transaction</>
        // <AjnaFormContentTransaction orderInformation={AjnaBorrowFormOrder} />
      )}
    </AjnaFormView>
  )
}
