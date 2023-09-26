import type { TxState } from '@oasisdex/transactions'
import { createAccount } from 'blockchain/calls/accountFactory'
import type { CreateDPMAccount } from 'blockchain/calls/accountFactory.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { ethers } from 'ethers'
import type { CommonTransactionServices } from 'features/stateMachines/transaction'
import {
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { Observable } from 'rxjs'

import type { SuccessTxState } from '@oasisdex/transactions/lib/src/types'

export function getCreateDPMAccountTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
) {
  const service = startTransactionService<CreateDPMAccount>(
    txHelpers$,
    context$,
    extractDpmProxyFromTxnReceipt,
  )
  return createTransactionStateMachine<CreateDPMAccount, UserDpmAccount>(createAccount, {
    kind: TxMetaKind.createAccount,
  }).withConfig({
    services: {
      ...commonTransactionServices,
      startTransaction: service,
    },
  })
}

function extractDpmProxyFromTxnReceipt(
  context: ContextConnected,
  txnReceipt: SuccessTxState | TxState<CreateDPMAccount>,
): UserDpmAccount | undefined {
  if ('receipt' in txnReceipt) {
    const logParser = new ethers.utils.Interface(
      getNetworkContracts(NetworkIds.MAINNET, context.chainId).accountFactory.abi.default,
    )

    // find proxy address event
    const proxy = txnReceipt.receipt.logs.reduce(
      (discoveredProxy: string | undefined, log: any) => {
        if (discoveredProxy) {
          return discoveredProxy
        }
        try {
          return logParser.parseLog(log).args as unknown as UserDpmAccount // args is the proxy
        } catch (e) {
          // throws when reading an event from a non AccountFactory ABI - assume no proxy from this event
          return undefined
        }
      },
      undefined,
    )

    if (!proxy) {
      throw new Error(
        `could not read DPM proxy address from txnReceipt ${JSON.stringify(txnReceipt)}`,
      )
    }

    return proxy
  } else {
    return undefined
  }
}
