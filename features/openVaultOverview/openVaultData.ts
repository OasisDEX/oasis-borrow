import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged } from 'rxjs/operators'

import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'

export interface OpenVaultOverview {
  ilksWithFilters: IlksWithFilters
}

export function createOpenVaultOverview$(
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
): Observable<OpenVaultOverview> {
  return ilksWithFilter$(ilksListWithBalances$).pipe(
    map((ilksWithFilters) => ({ ilksWithFilters })),
    distinctUntilChanged(isEqual),
  )
}
