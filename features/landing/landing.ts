import { IlkDataList } from 'blockchain/ilks'
import { getAggregationTokenKey, IlksPerToken } from 'features/ilks/ilksPerToken'
import { chain, pick, sumBy } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Landing {
  popular: IlksPerToken
  newest: IlksPerToken
}

export function getPopular(ilksPerToken: IlksPerToken, n: number = 3) {
  const reducedDebts = Object.keys(ilksPerToken).reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: {
        totalIlksDebt: sumBy(ilksPerToken[curr], (ilk) => ilk.ilkDebt.toNumber()),
        totalIlksDebtAvailable: sumBy(ilksPerToken[curr], (ilk) => ilk.ilkDebtAvailable.toNumber()),
      },
    }
  }, {} as Record<string, { totalIlksDebt: number; totalIlksDebtAvailable: number }>)

  const nTopTokens = chain(reducedDebts)
    .keys()
    .filter((tokenKey) => reducedDebts[tokenKey].totalIlksDebtAvailable > 0)
    .sort((a, b) => reducedDebts[b].totalIlksDebt - reducedDebts[a].totalIlksDebt)
    .take(n)
    .value()

  return pick(ilksPerToken, nTopTokens)
}

export function getNewest(ilks: IlkDataList) {
  const { token } = ilks[ilks.length - 1]
  const aggregationTokenKey = getAggregationTokenKey(token)

  if (aggregationTokenKey) {
    return { [aggregationTokenKey]: ilks.filter((ilk) => getAggregationTokenKey(ilk.token)) }
  }

  return { [token]: ilks.filter((ilk) => ilk.token === token) }
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
): Observable<Landing> {
  return combineLatest(ilkDataList$, ilksPerToken$).pipe(
    map(([ilkDataList, tokensWithIlks]) => getCollateralCards(ilkDataList, tokensWithIlks)),
  )
}
