import { TxMeta } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { DsProxy, OperationExecutor } from 'types/ethers-contracts'

import { zero } from '../../helpers/zero'
import { amountToWei } from '../utils'
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
  options: ({ token, amount = zero }) => {
    return token === 'ETH' && amount.gt(zero)
      ? { value: amountToWei(amount, 'ETH').toFixed(0) }
      : {}
  },
}

function getCallData(data: OperationExecutorTxMeta, context: ContextConnected) {
  return (
    context
      .contract<OperationExecutor>(context.operationExecutor)
      // .methods.executeOp(data.calls, data.operationName)
      .methods.executeOp(data.calls, 'CustomOperation') // TODO: Remove hardcoded operation name and pull from transcaction data from lib response
      .encodeABI()
  )
}
