import { TxMeta } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { Contract } from 'ethers'

import { zero } from '../../helpers/zero'
import { DsProxy } from '../../types/web3-v1-contracts/ds-proxy'
import dsProxy from '../abi/ds-proxy.json'
import { default as OperationExecutorAbi } from '../abi/operation-executor.json'
import { contractDesc } from '../config'
import { ContextConnected } from '../network'
import { amountToWei } from '../utils'
import { TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

export interface OperationExecutorTxMeta extends TxMeta {
  kind: TxMetaKind.operationExecutor
  calls: any // TODO: Should be ActionCall[] instead of any but it needs to update common lib.
  operationName: string
  proxyAddress: string
  token?: string
  amount?: BigNumber
}

export const callOperationExecutor: TransactionDef<OperationExecutorTxMeta> = {
  call: (args, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, args.proxyAddress)).methods[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    return [context.operationExecutor.address, getCallData(data, context)]
  },
  options: ({ token, amount = zero }) =>
    token === 'ETH' && amount.gt(zero) ? { value: amountToWei(amount, 'ETH').toFixed(0) } : {},
}

function getCallData(data: OperationExecutorTxMeta, context: ContextConnected) {
  const operatorExecutor = new Contract(context.operationExecutor.address, OperationExecutorAbi)

  return operatorExecutor.interface.encodeFunctionData('executeOp', [
    data.calls,
    data.operationName,
  ])
}
