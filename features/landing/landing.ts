import { IlkDataList } from 'blockchain/ilks'
import { popularIlksWithFilter$, PopularIlksWithFilters } from 'features/ilks/popularIlksFilters'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { FeaturedIlk } from './featuredIlksData'

export interface Landing {
  ilks: PopularIlksWithFilters
  featuredIlks: FeaturedIlk[]
}

export function createLanding$(
  ilkDataList$: Observable<IlkDataList>,
  featuredIlks: Observable<FeaturedIlk[]>,
): Observable<Landing> {
  return combineLatest(popularIlksWithFilter$(ilkDataList$), featuredIlks).pipe(
    map(([ilks, featuredIlks]) => ({
      ilks,
      featuredIlks,
    })),
  )
}
