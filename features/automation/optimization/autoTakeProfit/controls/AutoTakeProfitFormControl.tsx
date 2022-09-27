// import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import React from 'react'

import { SetupAutoTakeProfit } from '../sidebars/SetupAutoTakeProfit'

interface AutoTakeProfitFormControlProps {
    isAutoTakeProfitActive: boolean
}

export function AutoTakeProfitFormControl({isAutoTakeProfitActive}: AutoTakeProfitFormControlProps) {
  //  TODO ŁW use AddAndRemoveTriggerControl later
  return (
    <>
      <SetupAutoTakeProfit isAutoTakeProfitActive={isAutoTakeProfitActive} />
    </>
  )
}
