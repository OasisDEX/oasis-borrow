import type { Provider } from '@ethersproject/providers'
import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { GasMultiplier } from 'blockchain/better-calls/utils'
import type { ContractTransaction, ethers, Signer } from 'ethers'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import type { Observable } from 'rxjs'
import { from, of } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

interface sendGenericTransactionProps {
  contract: ethers.Contract
  method: string
  params: unknown[]
  signer: Signer
}

export const sendGenericTransaction$ = ({
  contract,
  method,
  params,
  signer,
}: sendGenericTransactionProps): Observable<TxState<TxMeta>> => {
  return from(
    contract.estimateGas[method](...params).then((val) =>
      new BigNumber(val.toString()).multipliedBy(GasMultiplier).toFixed(0),
    ),
  ).pipe(
    switchMap((gasLimit) =>
      from(contract[method](...params, { gasLimit }))
        .pipe(
          switchMap((tx: ContractTransaction) => {
            return from((signer.provider as Provider).waitForTransaction(tx.hash)).pipe(
              map((receipt) => {
                const status =
                  receipt.status === 1
                    ? TxStatus.Success
                    : receipt.status === 0
                    ? TxStatus.Error
                    : TxStatus.WaitingForConfirmation

                return {
                  status,
                  receipt,
                  txHash: receipt.transactionHash,
                }
              }),
              startWith({
                receipt: {},
                status: TxStatus.WaitingForConfirmation,
                txHash: tx.hash,
              }),
            )
          }),
        )
        .pipe(
          startWith({
            receipt: {},
            status: TxStatus.WaitingForConfirmation,
            txHash: '',
          }),
          takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)),
          catchError((error) => {
            console.warn('Sending transaction failed', error)

            return of({
              receipt: {},
              status: TxStatus.Error,
              txHash: '',
            })
          }),
        ),
    ),
  )
}
