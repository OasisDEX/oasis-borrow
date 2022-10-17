import { DiscoveryFiltersSettings, DiscoveryTableRowData } from 'features/discovery/types'
import { useObservable } from 'helpers/observableHook'
import { stringify } from 'querystring'
import { of } from 'ramda'
import { useMemo } from 'react'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface DiscoveryDataResponse {
  data?: {
    rows: DiscoveryTableRowData[]
  }
  error?: boolean
}

function getDiscoveryData$(endpoint: string, query: string): Observable<DiscoveryDataResponse> {
  return ajax({
    url: `/mocks/discovery${endpoint}?${query}`,
    method: 'GET',
  }).pipe(
    map(({ response }) => ({ data: response })),
    catchError(() => of({ error: true })),
  )
}

export function getDiscoveryData(endpoint: string, settings: DiscoveryFiltersSettings) {
  const discoveryData$ = useMemo(() => getDiscoveryData$(endpoint, stringify(settings)), [
    endpoint,
    settings,
  ])
  const [discoveryData] = useObservable(discoveryData$)

  return discoveryData
}
