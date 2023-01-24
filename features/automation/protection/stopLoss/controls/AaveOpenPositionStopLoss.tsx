import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import React from 'react'
import { getAaveStopLossData } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLossAave'
import { Sender, StateFrom } from 'xstate'
import { OpenAaveEvent, OpenAaveStateMachine } from 'features/aave/open/state'



export function AaveOpenPositionStopLoss({ state, send }: OpenAaveStateProps) {
  // TODO move to wrapper and specifc case so proxy would always be available there
  const { stopLossSidebarProps, automationContextProps } = getAaveStopLossData(
    state.context,
    send,
    'multiply',
  )
  console.log('stopLossSidebarProps', stopLossSidebarProps)
  console.log('automationContextProps', automationContextProps)
  return (
    <AutomationContextInput {...automationContextProps}>
      <SidebarAdjustStopLossEditingStage {...stopLossSidebarProps} />
    </AutomationContextInput>
  )
}
