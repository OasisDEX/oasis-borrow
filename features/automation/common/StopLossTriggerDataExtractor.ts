import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { networksById } from 'blockchain/config'
import { Vault } from 'blockchain/vaults'
import { ethers } from 'ethers'
import { last } from 'lodash'

import { TriggerRecord, TriggersData } from '../triggers/AutomationTriggersData'
import { TriggersTypes } from './enums/TriggersTypes'

function getSLLevel(rawBytes: string): BigNumber {
  const values = ethers.utils.defaultAbiCoder.decode(['uint256', 'bool', 'uint256'], rawBytes)
  const slLevel = new BigNumber(values[2].toString()).dividedBy(100)
  return slLevel
}

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
}

export function extractSLData(data: TriggersData): StopLossTriggerData {
  const doesStopLossExist = data.triggers ? data.triggers.length > 0 : false
  if (doesStopLossExist) {
    const slRecord: TriggerRecord | undefined = data.triggers ? last(data.triggers) : undefined
    if (!slRecord) throw data /* TODO: This is logically unreachable, revrite so typecheck works */
    return {
      isStopLossEnabled: true,
      stopLossLevel: getSLLevel(slRecord.executionParams),
      isToCollateral: slRecord.triggerType === TriggersTypes.StopLossToCollateral,
    } as StopLossTriggerData
  } else {
    return {
      isStopLossEnabled: false,
      stopLossLevel: new BigNumber(0),
    } as StopLossTriggerData
  }
}

function buildTriggerData(id: BigNumber, isCloseToCollateral: boolean, slLevel: number): string {
  return ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'bool', 'uint256'],
    [id.toNumber(), isCloseToCollateral, Math.round(slLevel)],
  )
}

export function prepareTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber
): AutomationBaseTriggerData {
  const slLevel: number = stopLossLevel.toNumber()
  const networkConfig = networksById[vaultData.chainId]

  return {
    cdpId: vaultData.id,
    triggerType: isCloseToCollateral
      ? new BigNumber(TriggersTypes.StopLossToCollateral)
      : new BigNumber(TriggersTypes.StopLossToDai),
    proxyAddress: vaultData.owner,
    serviceRegistry: networkConfig.serviceRegistry,
    triggerData: buildTriggerData(vaultData.id, isCloseToCollateral, slLevel),
  }
}

export function isTxStatusFinal(status: TxStatus) {
  return (
    status === TxStatus.CancelledByTheUser ||
    status === TxStatus.Failure ||
    status === TxStatus.Error ||
    status === TxStatus.Success
  )
}

export function isTxStatusFailed(status: TxStatus) {
  return isTxStatusFinal(status) && status !== TxStatus.Success
}