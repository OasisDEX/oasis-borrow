import type { ManageMultiplyVaultChange } from './ManageMultiplyVaultChange.types'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export function applyManageVaultEnvironment<VS extends ManageMultiplyVaultState>(
  change: ManageMultiplyVaultChange,
  state: VS,
): VS {
  if (change.kind === 'priceInfo') {
    return {
      ...state,
      priceInfo: change.priceInfo,
    }
  }

  if (change.kind === 'balanceInfo') {
    return {
      ...state,
      balanceInfo: change.balanceInfo,
    }
  }

  if (change.kind === 'ilkData') {
    return {
      ...state,
      ilkData: change.ilkData,
    }
  }

  if (change.kind === 'vault') {
    return {
      ...state,
      vault: change.vault,
    }
  }

  if (change.kind === 'slippage') {
    return {
      ...state,
      slippage: change.slippage,
    }
  }

  if (change.kind === 'vaultHistory') {
    return {
      ...state,
      vaultHistory: change.vaultHistory,
    }
  }

  if (change.kind === 'automationTriggersData') {
    return {
      ...state,
      stopLossData: change.stopLossData,
      autoSellData: change.autoSellData,
      autoBuyData: change.autoBuyData,
      autoTakeProfitData: change.autoTakeProfitData,
    }
  }

  return state
}
