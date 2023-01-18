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
import { AccountFactory } from '../../../../types/web3-v1-contracts/account-factory'
import * as accountFactoryAbi from '../../../../blockchain/abi/account-factory.json'
import { ethers } from 'ethers'
import { SuccessTxState, TransactionReceiptLike } from '@oasisdex/transactions/src/types'
import { TxState } from '@oasisdex/transactions'

export function getCreateDPMAccountTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
) {
  const service = startTransactionService<CreateDPMAccount>(
    txHelpers$,
    context$,
    extractDpmProxyIdFromTxnReceipt,
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

function extractDpmProxyIdFromTxnReceipt(context: ContextConnected, txnReceipt: any) {
  const iface = new ethers.utils.Interface(context.accountFactory.abi.default)

  // find proxy address event
  const proxy = txnReceipt.receipt.logs.reduce((discoveredProxy: string | undefined, log: any) => {
    if (discoveredProxy) {
      return discoveredProxy
    }
    try {
      return iface.parseLog(log).args // this is the proxy
    } catch (e) {
      // throws when reading an event from a different contract
      return undefined
    }
  }, undefined)

  if (!proxy) {
    throw new Error(`could not read proxy address from txnReceipt ${JSON.stringify(txnReceipt)}`)
  }
  return proxy
}
