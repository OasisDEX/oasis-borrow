import BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/generalManageVault'
import getConfig from 'next/config'
import { type } from 'os'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function checkVaultTypeUsingApi$(  token: string, id: BigNumber): Observable<VaultType> {
  const vaultType = getVaultFromApi$(token, id).pipe(
    map((resp) => {
        const vaultResponse  = resp as {
          vaultId: BigNumber,
          type: 'borrow' | 'multiply',
          proxyAddress: string
        }
        return vaultResponse.type as VaultType    
    }
  ),
  )
   return vaultType
}

export function getVaultFromApi$(
  token: string,  
  vaultId: BigNumber
): Observable< {
    vaultId: BigNumber,
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
    id: BigNumber,
    token: string,
    vaultType: VaultType,
    // proxyAddress: string,
  ): Observable<void> {
    return ajax({
      url: `${basePath}/api/tos`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + token,
      },
      body: {
        id: id.toFixed(0),
        type: vaultType,
        // proxyAddress: proxyAddress
      },
    }).pipe(map((_) => {}))
  }
