import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { GasMultiplier } from 'blockchain/better-calls/utils'
import { getOverrides } from 'blockchain/better-calls/utils/get-overrides'
import type { ethers } from 'ethers'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import type { OmniTxData } from 'features/omni-kit/hooks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { Observable } from 'rxjs'
import { combineLatest, from, of } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

export const sendOmniTransaction$ = ({
  signer,
  networkId,
  proxyAddress,
  txData,
}: {
  signer: ethers.Signer
  networkId: OmniSupportedNetworkIds
  proxyAddress: string
  txData: OmniTxData
}): Observable<{
  status: TxStatus
  receipt: ethers.providers.TransactionReceipt
  txHash: string
}> =>
  combineLatest(
    from(validateParameters({ signer, networkId, proxyAddress })),
    from(getOverrides(signer)),
  )
    .pipe(
      switchMap(([{ dpm }, override]) =>
        from(
          dpm.estimateGas
            .execute(txData.to, txData.data, {
              ...override,
              value: txData.value,
            })
            .then((val) => new BigNumber(val.toString()).multipliedBy(GasMultiplier).toFixed(0)),
        ).pipe(
          switchMap((gasLimit) => {
            return from(
              dpm.execute(txData.to, txData.data, {
                ...override,
                value: txData.value,
                gasLimit: gasLimit ?? undefined,
              }),
            ).pipe(
              switchMap((tx) => {
                return from(signer.provider!.waitForTransaction(tx.hash)).pipe(
                  map((receipt) => {
                    let isSuccess = false
                    let isError = false

                    // success
                    if (receipt.status === 1) {
                      isSuccess = true
                    }

                    // error
                    if (receipt.status === 0) {
                      isError = true
                    }

                    const status = isSuccess
                      ? TxStatus.Success
                      : isError
                      ? TxStatus.Error
                      : TxStatus.WaitingForConfirmation

                    return {
                      status,
                      receipt,
                      txHash: receipt.transactionHash,
                    }
                  }),
                  startWith({
                    status: TxStatus.WaitingForConfirmation,
                    txHash: tx.hash,
                    receipt: {},
                  }),
                )
              }),
            )
          }),
        ),
      ),
    )
    .pipe(
      startWith({
        status: TxStatus.WaitingForConfirmation,
        txHash: '',
        receipt: {},
      }),
      takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)),
      catchError((error) => {
        console.warn('Sending transaction failed', error)
        return of({
          status: TxStatus.Error,
          txHash: '',
          receipt: {},
        })
      }),
    )
