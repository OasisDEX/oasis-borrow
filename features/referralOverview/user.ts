import { Web3Context } from '@oasisdex/web3-context'
import { User, WeeklyClaim } from '@prisma/client'
import { TxHelpers } from 'components/AppContext'
import { ethers } from 'ethers'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { ClaimChanges, /* ClaimStages */ } from './manageClaimTransitions'
import { performClaimMultiple } from './performClaimMultiple'

export type UserState =
  | 'currentUserNoClaims'
  | 'currentUserWithClaims'
  | 'newUser'
  | 'walletConnectionInProgress'

interface Claim {
  weeks: ethers.BigNumber[]
  amounts: ethers.BigNumber[]
  proofs: string[][]
}
interface Referrer {
  referrer: string | null
}

export interface UserReferralState {
  state: UserState
  user?: User
  referrals?: string[]
  claims?: Claim
  topEarners?: string[]
  performClaimMultiple?: () => void,
  referrer: Referrer
}

export function createUserReferral$(
  web3Context$: Observable<Web3Context>,
  txHelpers$: Observable<TxHelpers>,
  getUserFromApi$: (address: string) => Observable<User | null>,
  getReferralsFromApi$: (address: string) => Observable<User[] | null>,
  getTopEarnersFromApi$: () => Observable<User[] | null>,
  getWeeklyClaimsFromApi$: (address: string) => Observable<WeeklyClaim[] | null>,
  checkReferralLocalStorage$: () => Observable<Referrer>
): Observable<UserReferralState> {
  return web3Context$.pipe(
    switchMap((web3Context) => {
      if (web3Context.status !== 'connected') {
        return of({ state: 'walletConnectionInProgress' } as UserReferralState)
      }
      const change$ = new Subject<ClaimChanges>()
      function change(ch: ClaimChanges) {
        change$.next(ch)
      }

      return combineLatest(
        getUserFromApi$(web3Context.account),
        getReferralsFromApi$(web3Context.account),
        getTopEarnersFromApi$(),
        getWeeklyClaimsFromApi$(web3Context.account),
        checkReferralLocalStorage$(),
        txHelpers$,
      ).pipe(
        map(([user, referrals, topEarners, weeklyClaims, referrer]) => {
          console.log(referrer)
          if (!user) {
            return {
              state: 'newUser',
              referrer
            }
          }
          const referralsOut = referrals?.map((r) => r.address)
          const claimsOut = {
            weeks: weeklyClaims?.map((item) => ethers.BigNumber.from(item.week_number)),
            amounts: weeklyClaims?.map((item) => ethers.BigNumber.from(item.amount)),
            proofs: weeklyClaims?.map((item) => item.proof),
          }
          const topEarnersOut = topEarners?.map((r) => r.address)
          change$.subscribe((ch) => console.log(ch))
          
          if (claimsOut.amounts) {
            return {
              state: 'currentUserWithClaims',
              user,
              referrals: referralsOut,
              claims: claimsOut,
              topEarners: topEarnersOut,
              performClaimMultiple: () =>
                performClaimMultiple(txHelpers$, change, {
                  stage: 'claim',
                  ...claimsOut,
                }),
            }
          }
          return {
            state: 'currentUserNoClaims',
            user,
            referrals: referralsOut,
            topEarners: topEarnersOut,
          }
        }),
      )
    }),
  )
}
