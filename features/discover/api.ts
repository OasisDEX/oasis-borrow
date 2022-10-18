import { DiscoverFiltersSettings, DiscoverTableRowData } from 'features/discover/types'
import { useObservable } from 'helpers/observableHook'
import { stringify } from 'querystring'
import { of } from 'ramda'
import { useMemo } from 'react'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface DiscoverDataResponse {
  data?: {
    rows: DiscoverTableRowData[]
  }
  error?: boolean
}

function getDiscoverData$(endpoint: string, query: string): Observable<DiscoverDataResponse> {
  return ajax({
    url: `${endpoint}?${query}`,
    method: 'GET',
  }).pipe(
    map(({ response }) => ({ data: response })),
    catchError(() => of({ error: true })),
  )
}

export function getDiscoverData(endpoint: string, settings: DiscoverFiltersSettings) {
  const discoverData$ = useMemo(() => getDiscoverData$(endpoint, stringify(settings)), [
    endpoint,
    settings,
  ])
  const [discoverData] = useObservable(discoverData$)

  return discoverData
}
