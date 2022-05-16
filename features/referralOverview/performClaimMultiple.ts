import { TxStatus } from '@oasisdex/transactions'
//import { approve, ApproveData } from 'blockchain/calls/erc20'
import { claimMultiple, ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
// import { ethers } from 'ethers'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { transactionToX } from 'helpers/form'
import { Observable, of } from 'rxjs'
import { first, retry, switchMap } from 'rxjs/operators'

import { ClaimChanges, Dependencies } from './manageClaimTransitions'
import { updateClaimsUsingApi$ } from './userApi'

export function performClaimMultiple(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ClaimChanges) => void,
  state: Dependencies,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(claimMultiple, {
          kind: TxMetaKind.claim,
          weeks: state.weeks,
          amounts: state.amounts,
          proofs: state.proofs,
        }).pipe(
          transactionToX<ClaimChanges, ClaimMultipleData>(
            { kind: 'txWaitingForApproval' },
            (txState) =>
              of({
                kind: 'txInProgress',
                claimTxHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                kind: 'txFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => {
              const jwtToken = jwtAuthGetToken(txState.account)
              if (txState.status === TxStatus.Success && jwtToken) {
                updateClaimsUsingApi$(
                  txState.account,
                  state.weeks.map((week: BigInt) => Number(week)),
                  jwtToken,
                ).subscribe()
              }

              return of({
                kind: 'txSuccess',
              })
            },
          ),
          retry(1),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}
