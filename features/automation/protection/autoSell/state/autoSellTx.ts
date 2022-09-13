import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { prepareAddAutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetAutoSellTxParams {
  autoSellState: AutoBSFormChange
  vault: Vault
}

interface AutoSellTx {
  addTxData: AutomationBotAddTriggerData
  txStatus?: TxStatus
}

export function getAutoSellTx({ autoSellState, vault }: GetAutoSellTxParams): AutoSellTx {
  const addTxData = useMemo(
    () =>
      prepareAddAutoBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicSell,
        execCollRatio: autoSellState.execCollRatio,
        targetCollRatio: autoSellState.targetCollRatio,
        maxBuyOrMinSellPrice: autoSellState.withThreshold
          ? autoSellState.maxBuyOrMinSellPrice || zero
          : zero,
        continuous: autoSellState.continuous,
        deviation: autoSellState.deviation,
        replacedTriggerId: autoSellState.triggerId,
        maxBaseFeeInGwei: autoSellState.maxBaseFeeInGwei,
      }),
    [
      autoSellState.execCollRatio.toNumber(),
      autoSellState.targetCollRatio.toNumber(),
      autoSellState.maxBuyOrMinSellPrice?.toNumber(),
      autoSellState.triggerId.toNumber(),
      autoSellState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )
  const txStatus = autoSellState.txDetails?.txStatus

  return {
    addTxData,
    txStatus,
  }
}
