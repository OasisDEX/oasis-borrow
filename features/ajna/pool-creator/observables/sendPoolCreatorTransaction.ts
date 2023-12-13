import type { Provider } from '@ethersproject/providers'
import type { TxMeta, TxState } from '@oasisdex/transactions';
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { GasMultiplier } from 'blockchain/better-calls/utils'
import { getNetworkContracts } from 'blockchain/contracts'
import { amountToWad } from 'blockchain/utils'
import type { ethers, Signer } from 'ethers'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import type { AjnaSupportedNetworksIds } from 'features/omni-kit/protocols/ajna/types'
import type { Observable } from 'rxjs'
import { combineLatest, from, of } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { AjnaErc20PoolFactory__factory as AjnaErc20PoolFactoryFactory } from 'types/ethers-contracts'

export async function getContract({
  signer,
  networkId,
}: {
  networkId: AjnaSupportedNetworksIds
  signer: ethers.Signer
}) {
  const ajnaErc20PoolFactoryAddress = getNetworkContracts(networkId).ajnaERC20PoolFactory.address
  const ajnaErc20PoolFactoryContract = AjnaErc20PoolFactoryFactory.connect(
    ajnaErc20PoolFactoryAddress,
    signer,
  )

  return ajnaErc20PoolFactoryContract
}

export const sendPoolCreatorTransaction$ = ({
  networkId,
  signer,
  collateralAddress,
  interestRate,
  quoteAddress,
}: {
  signer: Signer
  networkId: AjnaSupportedNetworksIds
  collateralAddress: string
  quoteAddress: string
  interestRate: BigNumber
}): Observable<TxState<TxMeta>> =>
  combineLatest(from(getContract({ signer, networkId })))
    .pipe(
      switchMap(([ajnaErc20PoolFactoryContract]) =>
        from(
          ajnaErc20PoolFactoryContract.estimateGas
            .deployPool(
              collateralAddress,
              quoteAddress,
              amountToWad(interestRate.div(100)).toString(),
            )
            .then((val) => new BigNumber(val.toString()).multipliedBy(GasMultiplier).toFixed(0)),
        ).pipe(
          switchMap(() => {
            return from(
              ajnaErc20PoolFactoryContract.deployPool(
                collateralAddress,
                quoteAddress,
                amountToWad(interestRate.div(100)).toString(),
              ),
            ).pipe(
              switchMap((tx) => {
                return from((signer.provider as Provider).waitForTransaction(tx.hash)).pipe(
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
