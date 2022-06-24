import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'

export type BasicBuyTriggerCreationData = {
  cdpId: BigNumber
  triggerType: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  triggerData: string
  proxyAddress: string
  kind: TxMetaKind.addTrigger
  replacedTriggerId: number
}

export function prepareBasicBuyTriggerCreationData(
  vaultData: Vault,
  execCollRatio: BigNumber,
  targetCollRatio: BigNumber,
  maxBuyPrice: BigNumber,
  continuous: boolean,
  deviation: BigNumber,
  replacedTriggerId: number,
): BasicBuyTriggerCreationData {
  const triggerType = new BigNumber(TriggerType.BasicBuy)
  return {
    cdpId: vaultData.id,
    triggerType,
    execCollRatio,
    targetCollRatio,
    maxBuyPrice,
    continuous,
    deviation,
    triggerData: encodeTriggerDataByType(CommandContractType.BasicBuyCommand, [
      vaultData.id.toString(),
      triggerType.toString(),
      execCollRatio.toString(),
      targetCollRatio.toString(),
      maxBuyPrice.toString(),
      continuous.toString(),
      deviation.toString(),
    ]),
    kind: TxMetaKind.addTrigger,
    replacedTriggerId,
    proxyAddress: vaultData.owner,
  }
}
