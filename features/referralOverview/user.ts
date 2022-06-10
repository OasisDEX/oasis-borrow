import { TxState, TxStatus } from '@oasisdex/transactions'
import { Web3Context } from '@oasisdex/web3-context'
import { User, WeeklyClaim } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { claimMultiple, ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { networksById } from 'blockchain/config'
import { TxHelpers } from 'components/AppContext'
import { ethers } from 'ethers'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { gql, GraphQLClient } from 'graphql-request'
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
      const { cacheApi } = networksById[web3Context.chainId]

      return combineLatest(
        getUserFromApi$(web3Context.account, trigger$),
        getReferralsFromApi$(web3Context.account),
        getWeeklyClaimsFromApi$(web3Context.account, trigger$),
        checkReferralLocalStorage$(),
        getClaimedClaims(new GraphQLClient(cacheApi), web3Context.account),
        txHelpers$,
      ).pipe(
        switchMap(([user, referrals, weeklyClaims, referrer, claimedClaims]) => {
          // newUser gets referrer address from local storage, currentUser from the db
          if (!user) {
            return of({
              state: 'newUser',
              referrer: referrer ? referrer.slice(1, -1) : null,
              trigger: trigger,
            })
          }

          const referralsOut = referrals?.map((r) => r.address)

          const claimedWeeks = claimedClaims.map((item) => item.week)
          const filteredWeeklyClaims = weeklyClaims?.filter(
            (item) => !claimedWeeks.includes(item.week_number),
          )

          const claimsOut = {
            weeks: filteredWeeklyClaims?.map((item) => ethers.BigNumber.from(item.week_number)),
            amounts: filteredWeeklyClaims?.map((item) => ethers.BigNumber.from(item.amount)),
            proofs: filteredWeeklyClaims?.map((item) => item.proof),
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

const claimedClaimsQuery = gql`
  query allClaimedWeeks($address: String!) {
    allClaims(filter: { address: { equalTo: $address } }) {
      nodes {
        address
        week
        amount
        timestamp
        txHash
      }
    }
  }
`
interface Claim {
  address: string
  week: number
  amount: number
  timestamp: Date
  txHash: string
}

async function getClaimedClaims(client: GraphQLClient, address: string): Promise<Claim[]> {
  const data = await client.request(claimedClaimsQuery, { address: address })
  return data.allClaims.nodes
}
