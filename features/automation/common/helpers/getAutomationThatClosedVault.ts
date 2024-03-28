import { AutomationKinds } from 'features/automation/common/types'

export function getAutomationThatClosedVault({
  stopLossTriggered,
  autoTakeProfitTriggered,
}: {
  stopLossTriggered: boolean
  autoTakeProfitTriggered: boolean
}) {
  return stopLossTriggered
    ? AutomationKinds.STOP_LOSS
    : autoTakeProfitTriggered
    ? AutomationKinds.AUTO_TAKE_PROFIT
    : undefined
}
