import {
  DiscoverApiErrors,
  DiscoverFiltersSettings,
  DiscoverTableRowData,
} from 'features/discover/types'
import { useObservable } from 'helpers/observableHook'
import getConfig from 'next/config'
import { stringify } from 'querystring'
import { of } from 'ramda'
import { useMemo } from 'react'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface DiscoverDataResponseError {
  code: DiscoverApiErrors
  reason?: string
}
export interface DiscoverDataResponse {
  rows: DiscoverTableRowData[]
  error?: DiscoverDataResponseError
}

function getDiscoverData$(endpoint: string, query: string): Observable<DiscoverDataResponse> {
  const url = getConfig()?.isProduction
    ? `${endpoint}?${query}`
    : `/api/proxy?url=https://staging.oasis.app${endpoint}?${query}`

  return ajax({
    url,
    method: 'GET',
  }).pipe(
    map(({ response }) => response),
    catchError(() => of({ error: { code: DiscoverApiErrors.UNKNOWN_ERROR } })),
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
