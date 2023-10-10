import type BigNumber from 'bignumber.js'
import { tokenBalance } from 'blockchain/better-calls/erc20'
import type { NetworkIds } from 'blockchain/networks'
import type { TokenBalances } from 'blockchain/tokens.types'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { map } from 'rxjs/operators'

export function getAaveSupportedTokenBalances$(
  aaveOraclePriceData$: (args: { token: string }) => Observable<BigNumber>,
  convertProtocolPriceToUsd: Observable<BigNumber>,
  tokens: string[],
  networkId: NetworkIds,
  address: string | undefined,
): Observable<TokenBalances> {
  const tokensWithUserBalance$ = tokens.map((token) => {
    return combineLatest(
      address ? tokenBalance({ token, account: address, networkId }) : of(zero),
      aaveOraclePriceData$({ token }),
      convertProtocolPriceToUsd,
    ).pipe(
      map(([balance, oraclePrice, protocolToUsdPriceConversion]) => {
        return {
          token,
          balance,
          price: oraclePrice.times(protocolToUsdPriceConversion),
        }
      }),
    )
  })

  return combineLatest(tokensWithUserBalance$).pipe(
    map((tokensWithUserBalance) => {
      return tokensWithUserBalance.reduce((acc, { token, balance, price }) => {
        return {
          ...acc,
          [token]: {
            balance,
            price,
          },
        }
      }, {})
    }),
  )
}
