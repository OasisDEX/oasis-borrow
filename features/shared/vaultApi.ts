import { Vault, VaultType as VaultTypeDB } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { MultiplyPillChange } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { LendingProtocol } from 'lendingProtocols'
import getConfig from 'next/config'
import { of } from 'ramda'
import { combineLatest, Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function checkVaultTypeUsingApi$(
  context$: Observable<Context>,
  pillChange: Observable<MultiplyPillChange>,
  positionInfo: { id: BigNumber; protocol: LendingProtocol },
): Observable<VaultType> {
  const pillChange$ = pillChange.pipe(
    startWith({ currentChange: '' } as unknown as MultiplyPillChange),
  )

  return combineLatest(context$, pillChange$).pipe(
    switchMap(([context, pillState]) => {
      if (pillState.currentStage === 'closeVault') {
        return of(VaultType.Multiply)
      }

      return getVaultFromApi$(
        positionInfo.id,
        new BigNumber(context.chainId),
        positionInfo.protocol,
      ).pipe(
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
    }),
  )
}

interface CheckMultipleVaultsResponse {
  [key: string]: VaultTypeDB
}

export function checkMultipleVaultsFromApi$(
  vaults: string[],
  protocol: string,
): Observable<CheckMultipleVaultsResponse> {
  return ajax({
    url: `/api/vaults/${protocol.toLowerCase()}?${vaults.map((vault) => `id=${vault}&`).join('')}`,
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
  chainId: BigNumber,
  protocol: LendingProtocol,
): Observable<
  | {
      vaultId: BigNumber
      type: VaultType
      chainId: BigNumber
    }
  | {}
> {
  return ajax({
    url: `${basePath}/api/vault/${vaultId}/${chainId}/${protocol.toLowerCase()}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const { vaultId, type, chainId, protocol } = resp.response as {
        vaultId: number
        type: VaultType
        chainId: number
        protocol: string
      }
      return { vaultId, type, chainId, protocol }
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
  protocol: string,
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
      chainId,
      protocol: protocol.toLowerCase(),
    },
  }).pipe(map((_) => {}))
}
