import type { TxMeta } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import * as accountImplementation from 'blockchain/abi/account-implementation.json'
import * as dsProxy from 'blockchain/abi/ds-proxy.json'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { contractDesc } from 'blockchain/networks'
import { amountToWei } from 'blockchain/utils'
import { zero } from 'helpers/zero'
import type { AccountImplementation, DsProxy, OperationExecutor } from 'types/web3-v1-contracts'

import type { TxMetaKind } from './txMeta'

export interface OperationExecutorTxMeta extends TxMeta {
  kind: TxMetaKind.operationExecutor
  calls: any // TODO: Should be ActionCall[] instead of any but it needs to update common lib.
  operationName: string
  proxyAddress: string
  token?: string
  amount?: BigNumber
}

export const callOperationExecutorWithDsProxy: TransactionDef<OperationExecutorTxMeta> = {
  call: (args, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, args.proxyAddress)).methods[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    const contracts = getNetworkContracts(context.chainId)
    ensureContractsExist(context.chainId, contracts, ['operationExecutor'])
    const { operationExecutor } = contracts
    return [operationExecutor.address, getCallData(data, context)]
  },
  options: ({ token, amount = zero }) =>
    token === 'ETH' && amount.gt(zero) ? { value: amountToWei(amount, 'ETH').toFixed(0) } : {},
}

export const callOperationExecutorWithDpmProxy: TransactionDef<OperationExecutorTxMeta> = {
  call: (args, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, args.proxyAddress))
      .methods['execute']
  },
  prepareArgs: (data, context) => {
    const contracts = getNetworkContracts(context.chainId)
    ensureContractsExist(context.chainId, contracts, ['operationExecutor'])
    const { operationExecutor } = contracts
    return [operationExecutor.address, getCallData(data, context)]
  },
  options: ({ token, amount = zero }) =>
    token === 'ETH' && amount.gt(zero) ? { value: amountToWei(amount, 'ETH').toFixed(0) } : {},
}

function getCallData(data: OperationExecutorTxMeta, context: ContextConnected) {
  const contracts = getNetworkContracts(context.chainId)
  ensureContractsExist(context.chainId, contracts, ['operationExecutor'])
  const { operationExecutor } = contracts
  return context
    .contract<OperationExecutor>(operationExecutor)
    .methods.executeOp(data.calls, data.operationName)
    .encodeABI()
}
