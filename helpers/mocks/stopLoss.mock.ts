import { TriggersData } from '../../features/automation/triggers/AutomationTriggersData'

// mock with 300% stop loss level
export const mockedStopLossTrigger: TriggersData = {
  isAutomationEnabled: true,
  triggers: [
    {
      commandAddress: '0xd0ca9883e4918894dd517847eb3673d656ec9f2d',
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
