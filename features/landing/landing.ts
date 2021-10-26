import { IlkDataList } from 'blockchain/ilks'
import { aggregateTokensByPattern, IlksPerToken } from 'features/ilks/ilksPerToken'
import { chain, pick, sumBy } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getPopular(ilksPerToken: IlksPerToken, n: number = 3) {
  const reducedDebts = Object.keys(ilksPerToken).reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: {
        totalIlksDebt: sumBy(ilksPerToken[curr], (ilk) => ilk.ilkDebt.toNumber()),
        totalIlksAvailable: sumBy(ilksPerToken[curr], (ilk) => ilk.ilkDebtAvailable.toNumber()),
      },
    }
  }, {} as Record<string, { totalIlksDebt: number; totalIlksAvailable: number }>)

  const nTopTokens = chain(reducedDebts)
    .keys()
    .filter((tokenKey) => reducedDebts[tokenKey].totalIlksAvailable > 0)
    .sort((a, b) => reducedDebts[b].totalIlksDebt - reducedDebts[a].totalIlksDebt)
    .take(n)
    .value()

  return pick(ilksPerToken, nTopTokens)
}

export function getNewest(ilks: IlkDataList) {
  const { token } = ilks[ilks.length - 1]
  const listOfAllIlks = ilks.filter((ilk) => ilk.token === token)
  const aggregatedTokenKey = aggregateTokensByPattern(token) || token

  return { [aggregatedTokenKey]: listOfAllIlks }
}

export function getCollateralCards(
  ilkDataList: IlkDataList,
  ilksPerToken: Record<string, IlkDataList>,
) {
  const popular = getPopular(ilksPerToken)
  const newest = getNewest(ilkDataList)

  return { popular, newest }
}

export function createLanding$(
  ilkDataList$: Observable<IlkDataList>,
  ilksPerToken$: Observable<IlksPerToken>,
): Observable<{ popular: IlksPerToken; newest: IlksPerToken }> {
  return combineLatest(ilkDataList$, ilksPerToken$).pipe(
    map(([ilkDataList, tokensWithIlks]) => getCollateralCards(ilkDataList, tokensWithIlks)),
  )
}
