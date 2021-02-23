import { IlkDataList } from 'blockchain/ilks'
import { ilksWithFilter$, IlksWithFilters } from 'features/ilks/ilksFilters'
import { FeaturedIlk } from 'features/vaultsOverview/vaultsOverview'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Landing {
  ilks: IlksWithFilters
  featuredIlks: FeaturedIlk[]
}

export function createLanding$(
  ilkDataList$: Observable<IlkDataList>,
  featuredIlks: Observable<FeaturedIlk[]>,
): Observable<Landing> {
  return combineLatest(ilksWithFilter$(ilkDataList$), featuredIlks).pipe(
    map(([ilks, featuredIlks]) => ({
      ilks,
      featuredIlks,
    })),
  )
}
