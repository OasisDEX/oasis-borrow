import BigNumber from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { AutomationBot, DsProxy } from 'types/ethers-contracts'

import { TxMetaKind } from './txMeta'

export type AutomationBotAddTriggerData = {
  kind: TxMetaKind.withdrawAndPayback
  cdpId: BigNumber
  triggerType: BigNumber
  serviceRegistry: string
  triggerData: string
  proxyAddress : string
}

function getAddAutomationTriggerCallData(
  data: AutomationBotAddTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBot } = context
  return contract<AutomationBot>(automationBot).methods.addTrigger(
    data.cdpId,
    data.triggerType,
    data.serviceRegistry,
    data.triggerData,
  ) as any
}

export const addAutomationBotTrigger: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    const { automationBot } = context
    return [automationBot.address, getAddAutomationTriggerCallData(data, context).encodeABI()]
  },
}
