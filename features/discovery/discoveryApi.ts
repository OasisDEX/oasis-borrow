import { DiscoveryFiltersSettings } from 'features/discovery/types'
import { useObservable } from 'helpers/observableHook'
import { stringify } from 'querystring'
import { of } from 'ramda'
import { useMemo } from 'react'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface DiscoveryDataResponse {
  // TODO: replace with real discovery data when available
  data?: any
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
  const discoveryData$ = useMemo(() => getDiscoveryData$(endpoint, stringify(settings)), [settings])
  const [discoveryData] = useObservable(discoveryData$)

  return discoveryData
}
