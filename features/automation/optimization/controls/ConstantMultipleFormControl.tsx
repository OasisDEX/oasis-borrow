import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

import { SidebarSetupConstantMultiple } from '../sidebars/SidebarSetupConstantMultiple'

interface ConstantMultipleFormControlProps {
  context: Context
  isConstantMultipleActive: boolean
}

export function ConstantMultipleFormControl({
  context,
  isConstantMultipleActive,
}: ConstantMultipleFormControlProps) {
  const { uiChanges /*, addGasEstimation$*/ } = useAppContext()
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  return (
    <SidebarSetupConstantMultiple
      stage={'editing'}
      constantMultipleState={constantMultipleState}
      isAddForm={true}
      isRemoveForm={false}
      isDisabled={false}
      isFirstSetup={true}
      onChange={(multiplier) => {
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'multiplier',
          multiplier: multiplier,
        })
      }}
    />
  )
}
