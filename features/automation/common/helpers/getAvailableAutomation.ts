import { protocolAutomations } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import type { VaultProtocol } from 'helpers/getVaultProtocol'

export function getAvailableAutomation(protocol: VaultProtocol) {
  return {
    isStopLossAvailable: protocolAutomations[protocol].includes(AutomationFeatures.STOP_LOSS),
    isAutoSellAvailable: protocolAutomations[protocol].includes(AutomationFeatures.AUTO_SELL),
    isAutoBuyAvailable: protocolAutomations[protocol].includes(AutomationFeatures.AUTO_BUY),
    isTakeProfitAvailable: protocolAutomations[protocol].includes(
      AutomationFeatures.AUTO_TAKE_PROFIT,
    ),
  }
}
