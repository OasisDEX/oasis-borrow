import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function getVaultFromApi$(
    vaultId: number,
    token: string
): Observable< {
    vaultId: number,
    type: 'borrow' | 'multiply',
    proxyAddress: string
  } | {}> {
      return ajax({
          url: `${basePath}/api/vault/${vaultId}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + token,
          },
      }).pipe(
        map((resp) => {
            const { vaultId, type, proxyAddress } = resp.response as {
                vaultId: number,
                type: 'borrow' | 'multiply',
                proxyAddress: string
              }
      
            return { vaultId, type, proxyAddress }
          }),
          catchError((err) => {
            if (err.xhr.status === 404) {
              return of({})
            }
            throw err
          }),
      )
  }


export function saveVaultUsingApi$(
    token: string,
    vaultId: number,
    type: 'borrow' | 'multiply',
    proxyAddress: string,
  ): Observable<void> {
    return ajax({
      url: `${basePath}/api/tos`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + token,
      },
      body: {
        id: vaultId,
        type: type,
        proxyAddress: proxyAddress
      },
    }).pipe(map((_) => {}))
  }
  