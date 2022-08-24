import { TxMeta } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'

import { TransactionDef } from '../../../../../blockchain/calls/callsHelpers'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { contractDesc } from '../../../../../blockchain/config'
import { ContextConnected } from '../../../../../blockchain/network'
import { amountToWei } from '../../../../../blockchain/utils'
import { DsProxy } from '../../../../../types/web3-v1-contracts/ds-proxy'
import { OperationExecutor } from '../../../../../types/web3-v1-contracts/operation-executor'
import { ActionCall } from '../../../../aave'

export interface ManageAavePositionData extends TxMeta {
  kind: TxMetaKind.operationExecutor
  calls: any // TODO: Should be ActionCall[] instead of any but it needs to update common lib.
  operationName: string
  proxyAddress: string
  token: string
  amount: BigNumber
}

export const manageAavePosition: TransactionDef<ManageAavePositionData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    return [context.operationExecutor.address, getCallData(data, context).encodeABI()]
  },
  options: ({ token, amount }) =>
    token === 'ETH' ? { value: amountToWei(amount, 'ETH').toFixed(0) } : {},
}

function getCallData(data: ManageAavePositionData, context: ContextConnected) {
  return context
    .contract<OperationExecutor>(context.operationExecutor)
    .methods.executeOp(translateCalls(data.calls), data.operationName)
}

function translateCalls(calls: ActionCall[]): [string, string][] {
  return calls.map((call) => {
    return [call.targetHash, call.callData]
  })
}
