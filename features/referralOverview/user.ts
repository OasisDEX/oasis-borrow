import { TxState, TxStatus } from '@oasisdex/transactions'
import { Web3Context } from '@oasisdex/web3-context'
import { User, WeeklyClaim } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { claimMultiple, ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { ethers } from 'ethers'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { first, map, share, startWith, switchMap } from 'rxjs/operators'

import { updateClaimsUsingApi$ } from './userApi'

export enum ClaimTxnState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

export type UserState = 'newUser' | 'currentUser' | 'walletConnectionInProgress'

export interface UserReferralState {
  user?: User
  claims?: boolean
  state: UserState
  referrer: string | null
  totalClaim?: string
  totalAmount?: string
  referrals?: string[]
  trigger: () => void
  topEarners?: string[]
  invitePending?: boolean
  claimTxnState?: ClaimTxnState
  performClaimMultiple?: () => void
}
const trigger$ = new Subject<void>()
function trigger() {
  trigger$.next()
}
export function createUserReferral$(
  web3Context$: Observable<Web3Context>,
  txHelpers$: Observable<TxHelpers>,
  getUserFromApi$: (address: string, trigger$: Subject<void>) => Observable<User | null>,
  getReferralsFromApi$: (address: string) => Observable<User[] | null>,
  getTopEarnersFromApi$: () => Observable<User[] | null>,
  getWeeklyClaimsFromApi$: (
    address: string,
    trigger$: Subject<void>,
  ) => Observable<WeeklyClaim[] | null>,
  checkReferralLocalStorage$: () => Observable<string | null>,
): Observable<UserReferralState> {
  return web3Context$.pipe(
    switchMap((web3Context) => {
      if (web3Context.status !== 'connected') {
        return of({ state: 'walletConnectionInProgress' } as UserReferralState)
      }
      return combineLatest(
        getUserFromApi$(web3Context.account, trigger$),
        getReferralsFromApi$(web3Context.account),
        getTopEarnersFromApi$(),
        getWeeklyClaimsFromApi$(web3Context.account, trigger$),
        checkReferralLocalStorage$(),
        txHelpers$,
      ).pipe(
        switchMap(([user, referrals, topEarners, weeklyClaims, referrer]) => {
          // newUser gets referrer address from local storage, currentUser from the db
          if (!user) {
            return of({
              state: 'newUser',
              referrer: referrer ? referrer.slice(1, -1) : null,
              trigger: trigger,
            })
          }

          const referralsOut = referrals?.map((r) => r.address)
          const claimsOut = {
            weeks: weeklyClaims?.map((item) => ethers.BigNumber.from(item.week_number)),
            amounts: weeklyClaims?.map((item) => ethers.BigNumber.from(item.amount)),
            proofs: weeklyClaims?.map((item) => item.proof),
          }
          const topEarnersOut = topEarners?.map((r) => r.address)

          const claimClick$ = new Subject<void>()

          function performClaimMultiple(): Observable<ClaimTxnState> {
            return txHelpers$.pipe(
              first(),
              switchMap(({ sendWithGasEstimation }) => {
                return sendWithGasEstimation(claimMultiple, {
                  kind: TxMetaKind.claim,
                  weeks: claimsOut.weeks,
                  amounts: claimsOut.amounts,
                  proofs: claimsOut.proofs,
                })
              }),
              map(
                (txnState: TxState<ClaimMultipleData>): ClaimTxnState => {
                  const jwtToken = jwtAuthGetToken(txnState.account)
                  if (txnState.status === TxStatus.Success && jwtToken && claimsOut.weeks) {
                    updateClaimsUsingApi$(
                      txnState.account,
                      claimsOut.weeks.map((week: ethers.BigNumber) => Number(week)),
                      jwtToken,
                    ).subscribe((res) => {
                      if (res === 200) {
                        trigger()
                      }
                    })
                  }

                  switch (txnState.status) {
                    case TxStatus.CancelledByTheUser:
                    case TxStatus.Failure:
                    case TxStatus.Error:
                      return ClaimTxnState.FAILED
                    case TxStatus.Propagating:
                    case TxStatus.WaitingForConfirmation:
                    case TxStatus.WaitingForApproval:
                    case undefined:
                      return ClaimTxnState.PENDING
                    case TxStatus.Success:
                      return ClaimTxnState.SUCCEEDED
                  }
                },
              ),
            )
          }

          function claimAllFunction() {
            claimClick$.next()
          }
          const performClaimMultiple$: Observable<
            (() => Observable<ClaimTxnState>) | undefined
          > = of(weeklyClaims ? performClaimMultiple : undefined)

          const ClaimTxnState$: Observable<ClaimTxnState | undefined> = combineLatest(
            claimClick$,
            performClaimMultiple$,
          ).pipe(
            map(([_, claimAll]) => claimAll),
            switchMap((claimAll) => {
              return claimAll ? claimAll() : of(undefined)
            }),
            share(),
            startWith(undefined),
          )

          return combineLatest(
            ClaimTxnState$,
            of({
              state: 'currentUser',
              user,
              referrer: user.user_that_referred_address,
              referrals: referralsOut,
              trigger: trigger,
              invitePending: user.user_that_referred_address && !user.accepted,
              claims: claimsOut.amounts && claimsOut.amounts.length > 0,
              topEarners: topEarnersOut,
              performClaimMultiple: claimAllFunction,
              totalAmount: new BigNumber(
                ethers.utils.formatEther(ethers.BigNumber.from(user.total_amount)),
              ).toFixed(2),
              totalClaim: claimsOut.amounts
                ? new BigNumber(
                    ethers.utils.formatEther(
                      claimsOut.amounts.reduce((p, c) => p.add(c), ethers.BigNumber.from('0')),
                    ),
                  ).toFixed(2)
                : '0.00',
            }),
          ).pipe(
            map(([txStatus, userState]) => ({
              ...userState,
              claimTxnState: txStatus,
            })),
          )
        }),
      )
    }),
    share(),
  )
}
