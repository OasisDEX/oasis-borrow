import BigNumber from 'bignumber.js'
import { AaveV2OracleAssertPriceArgs } from 'blockchain/aave'
import { TokenBalances } from 'blockchain/tokens'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getAaveSupportedTokenBalances$(
  balance$: (address: string, token: string) => Observable<BigNumber>,
  aaveOraclePriceData$: (args: AaveV2OracleAssertPriceArgs) => Observable<BigNumber>,
  convertProtocolPriceToUsd: () => Observable<BigNumber>,
  tokens: string[],
  address: string,
): Observable<TokenBalances> {
  const tokensWithUserBalance$ = tokens.map((token) => {
    return combineLatest(
      balance$(token, address),
      aaveOraclePriceData$({ token }),
      convertProtocolPriceToUsd(),
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
