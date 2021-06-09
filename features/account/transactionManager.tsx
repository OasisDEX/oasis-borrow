import { isDone, TxState, TxStatus } from '@oasisdex/transactions'
import { every1Seconds$ } from 'blockchain/network'
import { TxData } from 'components/AppContext'
import { isEqual } from 'lodash'
import moment from 'moment'
import { TFunction, withTranslation } from 'next-i18next'
import React from 'react'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'

export type TxMgrTransaction = {
  id: string
  lastChange: Date
} & {
  kind: 'blockchain'
  status: TxStatus
  raw: TxState<TxData>
}

export type NotificationTransaction = {
  tx: TxMgrTransaction
  withDescription: boolean
}

interface TransactionManager {
  pendingTransactions: TxMgrTransaction[]
  recentTransactions: TxMgrTransaction[]
  notificationTransaction?: NotificationTransaction
}

export function isTxDone(tr: TxMgrTransaction) {
  return tr.kind === 'blockchain' && isDone(tr.raw)
}

export function TxTranslator({
  i18nKey,
  params,
}: {
  i18nKey: string
  params?: {
    [key: string]: any
  }
}) {
  const Component = withTranslation()(({ t }: { t: TFunction }) => <>{t(i18nKey, params)}</>)

  return <Component />
}

function txState2Transaction(raw: TxState<TxData>): TxMgrTransaction {
  const { txNo, status, lastChange } = raw
  return {
    kind: 'blockchain',
    id: txNo.toString(),
    status,
    lastChange,
    raw,
  }
}

function compareTransactions(t1: TxMgrTransaction, t2: TxMgrTransaction): number {
  const t1Done: boolean = isTxDone(t1)
  const t2Done: boolean = isTxDone(t2)
  if (t1Done === t2Done) {
    return t2.lastChange.getTime() - t1.lastChange.getTime()
  }
  if (t1Done && !t2Done) {
    return 1
  }

  if (!t1Done && t2Done) {
    return -1
  }

  throw new Error('Should not get here!')
}

function filterTransactions(transactions: TxMgrTransaction[]) {
  // arrays for listing pending and recent transactions
  const pendingTransactions: TxMgrTransaction[] = []
  const recentTransactions: TxMgrTransaction[] = []

  // arrays for determining notification transaction
  let notificationTransaction: NotificationTransaction | undefined = undefined
  const signTransactions: TxMgrTransaction[] = []
  const errorTransactions: TxMgrTransaction[] = []
  const successTransactions: TxMgrTransaction[] = []
  const submittedTransactions: TxMgrTransaction[] = []

  transactions.forEach((tx) => {
    switch (tx.status) {
      case TxStatus.WaitingForApproval:
        pendingTransactions.push(tx)
        signTransactions.push(tx)
        break
      case TxStatus.Propagating:
      case TxStatus.WaitingForConfirmation:
        pendingTransactions.push(tx)
        submittedTransactions.push(tx)
        break
      case TxStatus.Success:
        recentTransactions.push(tx)
        successTransactions.push(tx)
        break
      case TxStatus.CancelledByTheUser:
      case TxStatus.Error:
      case TxStatus.Failure:
        recentTransactions.push(tx)
        errorTransactions.push(tx)
        break
      default:
        break
    }
  })

  // logic for determining notification transaction
  if (signTransactions.length > 0) {
    notificationTransaction = {
      tx: signTransactions[0],
      withDescription: true,
    }
  }

  if (!notificationTransaction && errorTransactions.length > 0) {
    // time based (10sec and disappear)
    for (let i = 0; i < errorTransactions.length; i += 1) {
      const tx = errorTransactions[i]

      if (
        !notificationTransaction &&
        moment(new Date()) < moment(tx.lastChange).add(10, 'seconds')
      ) {
        notificationTransaction = {
          tx,
          withDescription: true,
        }
      } else if (
        notificationTransaction &&
        moment(new Date()) > moment(tx.lastChange).add(10, 'seconds')
      ) {
        notificationTransaction = undefined
      }
    }
  }

  if (!notificationTransaction && successTransactions.length > 0) {
    // time based (10sec and disappear)
    for (let i = 0; i < successTransactions.length; i += 1) {
      const tx = successTransactions[i]

      if (
        !notificationTransaction &&
        moment(new Date()) < moment(tx.lastChange).add(10, 'seconds')
      ) {
        notificationTransaction = {
          tx,
          withDescription: true,
        }
      } else if (
        notificationTransaction &&
        moment(new Date()) > moment(tx.lastChange).add(10, 'seconds')
      ) {
        notificationTransaction = undefined
      }
    }
  }

  if (!notificationTransaction && submittedTransactions.length > 0) {
    const tx = submittedTransactions[0]

    notificationTransaction = {
      tx,
      withDescription: moment(new Date()) < moment(tx.lastChange).add(10, 'seconds'),
    }
  }

  return { recentTransactions, pendingTransactions, notificationTransaction }
}

export function createTransactionManager(
  transactions$: Observable<TxState<TxData>[]>,
): Observable<TransactionManager> {
  return combineLatest(transactions$, every1Seconds$).pipe(
    map(([transactions]) => {
      const allTransactions = transactions.map(txState2Transaction).sort(compareTransactions)

      const {
        recentTransactions,
        pendingTransactions,
        notificationTransaction,
      } = filterTransactions(allTransactions)

      return {
        pendingTransactions,
        recentTransactions,
        notificationTransaction,
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
