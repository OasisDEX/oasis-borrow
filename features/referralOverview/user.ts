import type { TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import type { User, WeeklyClaim } from '@prisma/client'
import BigNumber from 'bignumber.js'
import type { ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { claimMultiple } from 'blockchain/calls/merkleRedeemer'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getClaimedReferralRewards } from 'features/referralOverview/getClaimedReferralRewards'
import type { Web3Context } from 'features/web3Context'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of, Subject } from 'rxjs'
import { first, map, share, startWith, switchMap } from 'rxjs/operators'

import type { UserReferralState } from './user.types'
import { ClaimTxnState } from './user.types'

const trigger$ = new Subject<void>()
function trigger() {
  trigger$.next()
}
export function createUserReferral$(
  web3Context$: Observable<Web3Context>,
  txHelpers$: Observable<TxHelpers>,
  getUserFromApi$: (address: string, trigger$: Subject<void>) => Observable<User | null>,
  getReferralsFromApi$: (address: string) => Observable<User[] | null>,
  getReferralRewardsFromApi$: (
    address: string,
    trigger$: Subject<void>,
  ) => Observable<WeeklyClaim[] | null>,
  checkReferralLocalStorage$: (trigger$: Subject<void>) => Observable<string | null>,
): Observable<UserReferralState> {
  return web3Context$.pipe(
    switchMap((web3Context) => {
      if (web3Context.status !== 'connected') {
        return of({ state: 'walletConnectionInProgress', trigger: trigger } as UserReferralState)
      }

      return combineLatest(
        getUserFromApi$(web3Context.account, trigger$),
        getReferralsFromApi$(web3Context.account),
        getReferralRewardsFromApi$(web3Context.account, trigger$),
        checkReferralLocalStorage$(trigger$),
        getClaimedReferralRewards(web3Context.chainId, web3Context.account),
        txHelpers$,
      ).pipe(
        switchMap(([user, referrals, referralRewards, referrer, claimedReferralRewards]) => {
          // newUser gets referrer address from local storage, currentUser from the db
          if (!user && referrer) {
            const referrerAddress = referrer.slice(1, -1)
            // Check if referrer exists in the database
            return getUserFromApi$(referrerAddress, trigger$).pipe(
              switchMap((referrerEntity) => {
                return of({
                  state: 'newUser',
                  referrer: referrerEntity ? referrerAddress : null,
                  trigger: trigger,
                })
              }),
            )
          } else if (!user) {
            return of({
              state: 'newUser',
              referrer: null,
              trigger: trigger,
            })
          }

          const referralsOut = referrals?.map((r) => r.address)

          const claimedWeeksIds = claimedReferralRewards.map((item) => Number(item.week.week))

          const dueReferralRewards = referralRewards?.filter(
            (reward) => !claimedWeeksIds.includes(reward.week_number),
          )

          const claimsOut = {
            weeks: dueReferralRewards?.map((item) => new BigNumber(item.week_number)),
            amounts: dueReferralRewards?.map((item) => new BigNumber(item.amount)),
            proofs: dueReferralRewards?.map((item) => item.proof),
          }

          const claimClick$ = new Subject<void>()

          function performClaimMultiple(): Observable<ClaimTxnState> {
            return txHelpers$.pipe(
              first(),
              switchMap(({ sendWithGasEstimation }) => {
                return sendWithGasEstimation(claimMultiple, {
                  kind: TxMetaKind.claimReferralFees,
                  weeks: claimsOut.weeks,
                  amounts: claimsOut.amounts,
                  proofs: claimsOut.proofs,
                })
              }),
              map((txnState: TxState<ClaimMultipleData>): ClaimTxnState => {
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
              }),
            )
          }

          function claimAllFunction() {
            claimClick$.next()
          }
          const performClaimMultiple$: Observable<(() => Observable<ClaimTxnState>) | undefined> =
            of(referralRewards ? performClaimMultiple : undefined)

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

          const totalAmountRaw = referralRewards
            ? referralRewards.reduce((p, c) => p.plus(c.amount), zero)
            : zero
          const totalClaimRaw =
            claimsOut.amounts == null ? zero : claimsOut.amounts.reduce((p, c) => p.plus(c), zero)

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
              performClaimMultiple: claimAllFunction,
              totalAmount: formatAmount(amountFromWei(new BigNumber(totalAmountRaw)), 'USD'),
              totalClaim: formatAmount(amountFromWei(totalClaimRaw), 'USD'),
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
