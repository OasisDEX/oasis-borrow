import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { Observable, of } from 'rxjs'

export function mockTxState<T extends TxMeta>(
  meta: T,
  status: TxStatus = TxStatus.Success,
  receipt: unknown = {},
): Observable<TxState<T>> {
  if (status === TxStatus.Success) {
    return of({
      account: '0x',
      txNo: 0,
      networkId: '1',
      meta,
      start: new Date(),
      lastChange: new Date(),
      dismissed: false,
      status,
      txHash: '0xhash',
      blockNumber: 0,
      receipt,
      confirmations: 15,
      safeConfirmations: 15,
    })
  }
  if (status === TxStatus.Failure) {
    return of({
      account: '0x',
      txNo: 0,
      networkId: '1',
      meta,
      start: new Date(),
      lastChange: new Date(),
      dismissed: false,
      status,
      txHash: '0xhash',
      blockNumber: 0,
      receipt,
    })
  }
  if (status === TxStatus.Error) {
    return of({
      account: '0x',
      txNo: 0,
      networkId: '1',
      meta,
      start: new Date(),
      lastChange: new Date(),
      dismissed: false,
      status,
      txHash: '0xhash',
      blockNumber: 0,
      receipt,
      error: undefined,
    })
  }
  if (status === TxStatus.WaitingForApproval) {
    return of({
      account: '0x',
      txNo: 0,
      networkId: '1',
      meta,
      start: new Date(),
      lastChange: new Date(),
      dismissed: false,
      status,
      txHash: '0xhash',
      blockNumber: 0,
      receipt,
    })
  }
  if (status === TxStatus.Propagating || status === TxStatus.WaitingForConfirmation) {
    return of({
      account: '0x',
      txNo: 0,
      networkId: '1',
      meta,
      start: new Date(),
      lastChange: new Date(),
      dismissed: false,
      status,
      txHash: '0xhash',
      blockNumber: 0,
      broadcastedAt: new Date(),
    })
  }
  throw new Error('Not implemented yet')
}
