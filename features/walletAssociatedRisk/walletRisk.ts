import { getNetworkId, Web3Context } from '@oasisdex/web3-context'
import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { checkIfGnosisSafe } from '../../helpers/checkIfGnosisSafe'
import { jwtAuthGetToken } from '../termsOfService/jwt'
import { TermsAcceptanceState } from '../termsOfService/termsAcceptance'
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

      const networkId = getNetworkId()

      // verify risk only on mainnet
      if (networkId !== 1) {
        return of(undefined)
      }

      return termsAcceptance$.pipe(
        switchMap((termsAcceptance) => {
          if (termsAcceptance.stage !== 'acceptanceAccepted') {
            return of(undefined)
          }

          const { account, connectionKind, web3 } = web3Context

          const isGnosisSafe = checkIfGnosisSafe(connectionKind, web3)
          const jwtToken = jwtAuthGetToken(account)

          return getWalletRisk$(jwtToken!, isGnosisSafe).pipe(map((riskData) => riskData))
        }),
      )
    }),
  )
}
