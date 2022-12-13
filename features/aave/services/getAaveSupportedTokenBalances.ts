import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AaveOracleAssertPriceArgs } from '../../../blockchain/aave/oracleAssetPriceData'
import { TokenBalances } from '../../../blockchain/tokens'

export function getAaveSupportedTokenBalances$(
  balance$: (address: string, token: string) => Observable<BigNumber>,
  aaveOraclePriceData$: (args: AaveOracleAssertPriceArgs) => Observable<BigNumber>,
  chainLinkPrice$: () => Observable<BigNumber>,
  tokens: string[],
  address: string,
): Observable<TokenBalances> {
  const tokensWithUserBalance$ = tokens.map((token) => {
    return combineLatest(
      balance$(token, address),
      aaveOraclePriceData$({ token }),
      chainLinkPrice$(),
    ).pipe(
      map(([balance, oraclePrice, chainlinkPrice]) => ({
        token,
        balance,
        price: oraclePrice.times(chainlinkPrice),
      })),
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
