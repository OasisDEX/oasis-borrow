import { ethers } from 'ethers'
import { Observable } from 'rxjs'

import { createAccount, CreateDPMAccount } from '../../../../blockchain/calls/accountFactory'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../blockchain/network'
import { TxHelpers } from '../../../../components/AppContext'
import {
  CommonTransactionServices,
  createTransactionStateMachine,
  startTransactionService,
} from '../../transaction'

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
  return createTransactionStateMachine<CreateDPMAccount>(createAccount, {
    kind: TxMetaKind.createAccount,
  }).withConfig({
    services: {
      ...commonTransactionServices,
      startTransaction: service,
    },
  })
}

function extractDpmProxyFromTxnReceipt(context: ContextConnected, txnReceipt: any) {
  const iface = new ethers.utils.Interface(context.accountFactory.abi.default)

  // find proxy address event
  const proxy = txnReceipt.receipt.logs.reduce((discoveredProxy: string | undefined, log: any) => {
    if (discoveredProxy) {
      return discoveredProxy
    }
    try {
      return iface.parseLog(log).args // args is the proxy
    } catch (e) {
      // throws when reading an event from a non AccountFactory ABI - assume no proxy from this event
      return undefined
    }
  }, undefined)

  if (!proxy) {
    throw new Error(
      `could not read DPM proxy address from txnReceipt ${JSON.stringify(txnReceipt)}`,
    )
  }

  return proxy
}
