import { IlkDataList } from 'blockchain/ilks'
import { popularIlksWithFilter$, PopularIlksWithFilters } from 'features/ilks/popularIlksFilters'
import { combineLatest, Observable } from 'rxjs'
import { map, reduce } from 'rxjs/operators'

import { FeaturedIlk } from './featuredIlksData'
import { chain, pick, sumBy } from 'lodash'

export interface Landing {
  ilks: PopularIlksWithFilters
  featuredIlks: FeaturedIlk
}

// export function createLanding$(
//   ilkDataList$: Observable<IlkDataList>,
//   featuredIlks: Observable<FeaturedIlk>,
// ): Observable<Landing> {
//   return combineLatest(popularIlksWithFilter$(ilkDataList$), featuredIlks).pipe(
//     map(([ilks, featuredIlks]) => ({
//       ilks,
//       featuredIlks,
//     })),
//   )
// }

export function getMostPopular(tokensWithIlks: IlkDataList) {
  const reducedDebths = Object.keys(tokensWithIlks).reduce((acc, curr) => {
    return { ...acc, [curr]: sumBy(tokensWithIlks[curr], (ilk) => ilk.ilkDebt.toNumber()) }
  }, {} as Record<string, number>)

  const topThree = chain(reducedDebths)
    .keys()
    .sort((a, b) => reducedDebths[b] - reducedDebths[a])
    .take(3)
    .value()
  // console.log(pick(reducedIlks, topThree))
  return pick(tokensWithIlks, topThree)
}

export function getNewest(ilks: IlkDataList) {
  const { token } = ilks[ilks.length - 1]
  const listOfAllIlks = ilks.filter((ilk) => ilk.token === token)

  return { [token]: listOfAllIlks }
}

export function getCollateralCards(ilkDataList$: IlkDataList, tokensWithIlks: IlkDataList) {
  const mostPopular = getMostPopular(tokensWithIlks)
  const newest = getNewest(ilkDataList$)

  return { ...mostPopular, ...newest }
}

export function createLanding$(
  ilkDataList$: IlkDataList,
  tokensWithIlks$: Observable<IlkDataList>,
): Observable<Landing> {
  // return tokensWithIlks$.pipe(map(getCollateralCards))
  return combineLatest(ilkDataList$, tokensWithIlks$).pipe(
    map(([ilkDataList, tokensWithIlks]) => getCollateralCards(ilkDataList, tokensWithIlks)),
  )
}
