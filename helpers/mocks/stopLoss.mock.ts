import { TriggersData } from '../../features/automation/triggers/AutomationTriggersData'

export const mockedStopLossTrigger: TriggersData = {
  isAutomationEnabled: true,
  triggers: [
    {
      triggerId: 290,
      executionParams:
        '0x00000000000000000000000000000000000000000000000000000000000000870000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000012c',
    },
  ],
}

export const mockedEmptyStopLossTrigger: TriggersData = {
  isAutomationEnabled: false,
  triggers: [],
}
