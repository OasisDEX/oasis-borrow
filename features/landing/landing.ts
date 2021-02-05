import { IlkDataSummary } from 'blockchain/ilks'
import { FeaturedIlk } from 'features/vaultsOverview/vaultsOverview'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Landing {
  rows: IlkDataSummary[]
  featuredIlks: FeaturedIlk[]
}

export function createLanding$(
  ilkOverview$: Observable<IlkDataSummary[]>,
  featuredIlks: Observable<FeaturedIlk[]>,
): Observable<Landing> {
  return combineLatest(ilkOverview$, featuredIlks).pipe(
    map(([ilks, featuredIlks]) => ({
      rows: ilks,
      featuredIlks,
    })),
  )
}
