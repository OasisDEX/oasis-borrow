import { jwtAuthGetToken } from 'features/shared/jwt'
import { TermsAcceptanceState } from 'features/termsOfService/termsAcceptance'
import { getNetworkId, Web3Context } from 'features/web3Context'
import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { getWalletRisk$, WalletRiskResponse } from './walletRiskApi'

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

          const jwtToken = jwtAuthGetToken(web3Context.account)
          const chainId = getNetworkId()

          return getWalletRisk$(jwtToken!, chainId).pipe(map((riskData) => riskData))
        }),
      )
    }),
  )
}
