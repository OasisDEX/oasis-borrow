import { Vault, VaultType as VaultTypeDB } from '@prisma/client'
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
          type: VaultType
        }
        return vaultResponse.type as VaultType
      }
    }),
  )

  return vaultType
}

interface CheckMultipleVaultsResponse {
  [key: string]: VaultTypeDB
}

export function checkMultipleVaultsFromApi$(
  vaults: string[],
): Observable<CheckMultipleVaultsResponse> {
  return ajax({
    url: `${basePath}/api/vaults/?${vaults.map((vault) => `id=${vault}&`).join('')}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const { vaults } = resp.response as { vaults: Vault[] }
      const vaultTypeMapping: CheckMultipleVaultsResponse = {}

      vaults.forEach(({ vault_id, type }) => {
        vaultTypeMapping[vault_id] = type
      })

      return vaultTypeMapping
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of({})
      }
      throw err
    }),
  )
}

export function getVaultFromApi$(
  vaultId: BigNumber,
): Observable<
  | {
      vaultId: BigNumber
      type: VaultType
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
      const { vaultId, type } = resp.response as {
        vaultId: number
        type: VaultType
      }
      return { vaultId, type }
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
  chainId: number,
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
      chainId: chainId,
    },
  }).pipe(map((_) => {}))
}
