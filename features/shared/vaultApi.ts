import BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/generalManageVault'
import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function checkVaultTypeUsingApi$(id: BigNumber): Observable<VaultType> {
  const vaultType = getVaultFromApi$(id).pipe(
    map((resp) => {
      if (Object.keys(resp).length === 0) {
        return VaultType.Borrow
      } else {
        const vaultResponse = resp as {
          vaultId: BigNumber
          type: 'borrow' | 'multiply'
          proxyAddress: string
        }
        return vaultResponse.type as VaultType
      }
    }),
  )

  return vaultType
}

export function getVaultFromApi$(
  vaultId: BigNumber,
): Observable<
  | {
      vaultId: BigNumber
      type: 'borrow' | 'multiply'
      proxyAddress: string
    }
  | {}
> {
  return ajax({
    url: `${basePath}/api/vault/${vaultId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const { vaultId, type, proxyAddress } = resp.response as {
        vaultId: number
        type: 'borrow' | 'multiply'
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
): Observable<void> {
  return ajax({
    url: `${basePath}/api/vault`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      id: parseInt(id.toFixed(0)),
      type: vaultType,
      proxyAddress: '',
    },
  }).pipe(map((_) => {}))
}
