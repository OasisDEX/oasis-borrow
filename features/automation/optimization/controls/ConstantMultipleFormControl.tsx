import { useAppContext } from 'components/AppContextProvider'
import { Context } from 'blockchain/network'
import React, { useMemo } from 'react'
import { SidebarSetupConstantMultiple } from '../sidebars/SidebarSetupConstantMultiple'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'

interface ConstantMultipleFormControlProps {
    context: Context
    isConstantMultipleActive: boolean

}

export function ConstantMultipleFormControl({context, isConstantMultipleActive} : ConstantMultipleFormControlProps) {
    const { uiChanges/*, addGasEstimation$*/ } = useAppContext()

    return (

        <SidebarSetupConstantMultiple stage={'editing'} isAddForm={true} isRemoveForm={false} isDisabled={false} isFirstSetup={true} 
        onChange={(multiplier) => {
            uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
              type: 'multiplier',
              multiplier: multiplier,
            })
          }}
          />
    )
}