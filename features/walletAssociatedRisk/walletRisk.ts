import type { TermsAcceptanceState } from 'features/termsOfService/termsAcceptance.types'
import type { Web3Context } from 'features/web3Context'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import type { WalletRiskResponse } from './walletRiskApi'
import { getWalletRisk$ } from './walletRiskApi'

export function createWalletAssociatedRisk$(
  web3Context$: Observable<Web3Context>,
  termsAcceptance$: Observable<TermsAcceptanceState>,
): Observable<WalletRiskResponse | undefined> {
  return web3Context$.pipe(
    switchMap((web3Context) => {
      if (web3Context.status !== 'connected') {
        return of(undefined)
      }

      return termsAcceptance$.pipe(
        switchMap((termsAcceptance) => {
          if (termsAcceptance.stage !== 'acceptanceAccepted') {
            return of(undefined)
          }

          const chainId = web3Context.chainId
          const walletAddress = web3Context.account

          return getWalletRisk$(chainId, walletAddress).pipe(map((riskData) => riskData))
        }),
      )
    }),
  )
}
