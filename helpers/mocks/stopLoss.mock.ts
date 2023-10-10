import { NetworkIds } from 'blockchain/networks'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'

// mock with 300% stop loss level
export const mockedStopLossTrigger: TriggersData = {
  isAutomationDataLoaded: true,
  isAutomationEnabled: true,
  triggers: [
    {
      commandAddress: '0x31285a87fb70a62b5aaa43199e53221c197e1e3f',
      triggerId: 290,
      executionParams:
        '0x00000000000000000000000000000000000000000000000000000000000000870000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000012c',
    },
  ],
  chainId: NetworkIds.MAINNET,
}

export const mockedEmptyStopLossTrigger: TriggersData = {
  isAutomationDataLoaded: true,
  isAutomationEnabled: false,
  triggers: [],
  chainId: NetworkIds.MAINNET,
}
