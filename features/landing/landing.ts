import { IlkDataList } from 'blockchain/ilks'
import { IlksPerToken } from 'features/ilks/ilksPerToken'
import { chain, pick, sumBy } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getPopular(ilksPerToken: IlksPerToken, n: number = 3) {
  const reducedDebts = Object.keys(ilksPerToken).reduce((acc, curr) => {
    return { ...acc, [curr]: sumBy(ilksPerToken[curr], (ilk) => ilk.ilkDebt.toNumber()) }
  }, {} as Record<string, number>)

  const nTopTokens = chain(reducedDebts)
    .keys()
    .sort((a, b) => reducedDebts[b] - reducedDebts[a])
    .take(n)
    .value()

  return pick(ilksPerToken, nTopTokens)
}

export function getNewest(ilks: IlkDataList) {
  const { token } = ilks[ilks.length - 1]
  const listOfAllIlks = ilks.filter((ilk) => ilk.token === token)

  return { [token]: listOfAllIlks }
}

export function getCollateralCards(
  ilkDataList: IlkDataList,
  ilksPerToken: Record<string, IlkDataList>,
) {
  const mostPopular = getPopular(ilksPerToken)
  const newest = getNewest(ilkDataList)

  return { ...mostPopular, ...newest }
}

export function createLanding$(
  ilkDataList$: Observable<IlkDataList>,
  ilksPerToken$: Observable<IlksPerToken>,
): Observable<IlksPerToken> {
  return combineLatest(ilkDataList$, ilksPerToken$).pipe(
    map(([ilkDataList, tokensWithIlks]) => getCollateralCards(ilkDataList, tokensWithIlks)),
  )
}
