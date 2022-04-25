import { TriggersData } from '../../features/automation/protection/triggers/AutomationTriggersData'

// mock with 300% stop loss level
export const mockedStopLossTrigger: TriggersData = {
  isAutomationEnabled: true,
  triggers: [
    {
      commandAddress: '0x31285A87fB70a62b5AaA43199e53221c197E1e3f',
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
