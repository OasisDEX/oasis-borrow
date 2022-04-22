import { Web3Context } from '@oasisdex/web3-context'
import { User, WeeklyClaim } from '@prisma/client'
import { ethers } from 'ethers'
import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
// import { checkReferralLocalStorage, saveReferralLocalStorage } from './referralLocal'

export type UserState =
  | 'currentUser'
  | 'currentUserWithReferrals'
  | 'newUser'
  | 'walletConnectionInProgress'

interface Claim {
  weeks: ethers.BigNumber[]
  amounts: ethers.BigNumber[]
  proofs: string[][]
}

export interface UserReferralState {
  state: UserState
  user?: User
  referrals?: string[]
  claims?: Claim
  topEarners?: string[]
}

export function createUserReferral$(
  web3Context$: Observable<Web3Context>,
  getUserFromApi$: (address: string) => Observable<User | null>,
  getReferralsFromApi$: (address: string) => Observable<User[] | null>,
  getTopEarnersFromApi$: () => Observable<User[] | null>,
  getWeeklyClaimsFromApi$: (address: string) => Observable<WeeklyClaim[] | null>,
): Observable<UserReferralState> {
  return web3Context$.pipe(
    switchMap((web3Context) => {
      if (web3Context.status !== 'connected') {
        return of({ state: 'walletConnectionInProgress' } as UserReferralState)
      }
      return combineLatest(
        getUserFromApi$(web3Context.account),
        getReferralsFromApi$(web3Context.account),
        getTopEarnersFromApi$(),
        getWeeklyClaimsFromApi$(web3Context.account),
      ).pipe(
        map(([user, referrals, topEarners, weeklyClaims]) => {
          if (!user) {
            return {
              state: 'newUser',
            }
          } else {
            const referralsOut = referrals?.map((r) => r.address)
            const claimsOut = {
              weeks: weeklyClaims?.map((item) => ethers.BigNumber.from(item.week_number)),
              amounts: weeklyClaims?.map((item) => ethers.BigNumber.from(item.amount)),
              proofs: weeklyClaims?.map((item) => item.proof),
            }
            const topEarnersOut = topEarners?.map((r) => r.address)

            return {
              // @ts-ignore
              state: referralsOut?.length > 0 ? 'currentUserWithReferrals' : 'currentUser',
              user,
              referrals: referralsOut,
              claims: claimsOut,
              topEarners: topEarnersOut,
            }
          }
        }),
      )
    }),
  )
}
/* 
export function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: OpenMultiplyVaultChange) => void,
  state: OpenMultiplyVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
    amount: state.allowanceAmount!,
  })
    .pipe(
      transactionToX<OpenMultiplyVaultChange, ApproveData>(
        { kind: 'allowanceWaitingForApproval' },
        (txState) =>
          of({
            kind: 'allowanceInProgress',
            allowanceTxHash: (txState as any).txHash as string,
          }),
        (txState) =>
          of({
            kind: 'allowanceFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        (txState) => of({ kind: 'allowanceSuccess', allowance: txState.meta.amount }),
      ),
    )
    .subscribe((ch) => change(ch))
} */