import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { Observable, of } from 'rxjs'

export function mockOpenVaultTxState<T extends TxMeta>(
  meta: T,
  status: TxStatus = TxStatus.Success,
  receipt: unknown = {},
): Observable<TxState<T>> {
  if (status === TxStatus.Success) {
    const txState = {
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
    }
    return of(txState)
  } else if (status === TxStatus.Failure) {
    const txState = {
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
    }
    return of(txState)
  } else {
    throw new Error('Not implemented yet')
  }
}
