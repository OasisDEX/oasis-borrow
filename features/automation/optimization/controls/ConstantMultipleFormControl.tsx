import { useAppContext } from 'components/AppContextProvider'
import { Context } from 'blockchain/network'
import React, { useMemo } from 'react'
import { SidebarSetupConstantMultiple } from '../sidebars/SidebarSetupConstantMultiple'

interface ConstantMultipleFormControlProps {
    context: Context

}

export function ConstantMultipleFormControl({context} : ConstantMultipleFormControlProps) {
    const { uiChanges/*, addGasEstimation$*/ } = useAppContext()

    return (
        <SidebarSetupConstantMultiple stage={'editing'} isAddForm={true} isRemoveForm={false} isDisabled={false} isFirstSetup={true}/>
    )
}