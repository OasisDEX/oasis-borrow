import { DsProxy } from '@oasis-borrow/types/web3-v1-contracts/ds-proxy'
import { OperationExecutor } from '@oasis-borrow/types/web3-v1-contracts/operation-executor'
import { TxMeta } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'

import { default as OperationExecutorAbi } from '../../../../../blockchain/abi/operation-executor.json'
import { TransactionDef } from '../../../../../blockchain/calls/callsHelpers'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { contractDesc } from '../../../../../blockchain/config'
import { ContextConnected } from '../../../../../blockchain/network'
import { amountToWei } from '../../../../../blockchain/utils'
import { ActionCall } from '../../../../aave'
import { Contract } from 'ethers'

export interface OpenAavePositionData extends TxMeta {
  kind: TxMetaKind.operationExecutor
  calls: any // TODO: Should be ActionCall[] instead of any but it needs to update common lib.
  operationName: string
  proxyAddress: string
  token: string
  amount: BigNumber
}

export const openAavePosition: TransactionDef<OpenAavePositionData> = {
  call: (args, { contract }) => {
    console.log('args', args)
    return contract<DsProxy>(contractDesc(dsProxy, args.proxyAddress)).methods[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    console.log('prepared args:', [context.operationExecutor.address, getCallData(data, context)])
    return [context.operationExecutor.address, getCallData(data, context)]
  },
  options: ({ token, amount }) =>
    token === 'ETH' ? { value: amountToWei(amount, 'ETH').toFixed(0) } : {},
}

function getCallData(data: OpenAavePositionData, context: ContextConnected) {
  console.log('data.calls:', data.calls)
  console.log('context.operationExecutor.address', context.operationExecutor.address)
  console.log('OperationExecutorAbi', OperationExecutorAbi)
  const operatorExecutor = new Contract(context.operationExecutor.address, OperationExecutorAbi)

  return operatorExecutor.interface.encodeFunctionData('executeOp', [
    data.calls,
    data.operationName,
  ])
}
