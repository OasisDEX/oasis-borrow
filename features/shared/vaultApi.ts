import type { Vault, VaultType as VaultTypeDB } from '@prisma/client'
import type BigNumber from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import type { MultiplyPillChange } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { LendingProtocol } from 'lendingProtocols'
import { of } from 'ramda'
import { useEffect } from 'react'
import type { Observable } from 'rxjs'
import { combineLatest, EMPTY } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { useFetch } from 'usehooks-ts'

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
        positionInfo.id.toNumber(),
        context.chainId,
        positionInfo.protocol,
      ).pipe(
        map((vault) => vault.type),
        catchError(() => {
          // If any error occurs during the AJAX request, return Borrow type
          return of(VaultType.Borrow)
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
  chainId: NetworkIds,
): Observable<CheckMultipleVaultsResponse> {
  return ajax({
    url: `/api/vaults/${chainId}/${protocol.toLowerCase()}?${vaults
      .map((vault) => `id=${vault}&`)
      .join('')}`,
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

export interface ApiVault {
  vaultId: number
  chainId: NetworkIds
  protocol: LendingProtocol
  ownerAddress: string
  type: VaultType
}

export interface ApiVaultsParams {
  vaultIds: number[]
  chainId: NetworkIds
  protocol: LendingProtocol
}

export async function getApiVaults({
  vaultIds,
  protocol,
  chainId,
}: ApiVaultsParams): Promise<ApiVault[]> {
  if (vaultIds.length === 0) {
    return []
  }
  const vaultsQuery = vaultIds.map((id) => `id=${id}`).join('&')
  try {
    const response = await fetch(`/api/vaults/${chainId}/${protocol}?${vaultsQuery}`)
    if (response.status === 404) {
      return []
    }
    const vaults = await response.json()
    return vaults.vaults.map((vault: Vault) => {
      return {
        vaultId: vault.vault_id,
        chainId: vault.chain_id,
        protocol: vault.protocol,
        ownerAddress: vault.owner_address,
        type: vault.type,
      }
    })
  } catch (error) {
    console.warn(`Can't obtain vaults from API`, error)
    return []
  }
}

export function useApiVaults({ vaultIds, protocol, chainId }: ApiVaultsParams): ApiVault[] {
  const vaultsQuery = vaultIds.map((id) => `id=${id}`).join('&')

  const { data, error } = useFetch<{ vaults: Vault[] }>(
    `/api/vaults/${chainId}/${protocol}?${vaultsQuery}`,
  )

  useEffect(() => {
    if (error) {
      console.warn(`Can't obtain vaults from API`, error)
    }
  }, [error])

  return (
    data?.vaults.map((vault: Vault) => {
      return {
        vaultId: vault.vault_id,
        chainId: vault.chain_id as NetworkIds,
        protocol: vault.protocol as LendingProtocol,
        ownerAddress: vault.owner_address,
        type: vault.type as VaultType,
      }
    }) ?? []
  )
}

export function getVaultFromApi$(
  vaultId: number,
  chainId: number,
  protocol: LendingProtocol,
): Observable<ApiVault> {
  if (chainId === 0 || chainId < 1) {
    console.error('Invalid chainId')
    return EMPTY
  }
  if (vaultId === 0 || vaultId < 1) {
    console.error('Invalid vaultId')
    return EMPTY
  }
  return ajax({
    url: `/api/vault/${vaultId}/${chainId}/${protocol.toLowerCase()}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const { vaultId, type, chainId, ownerAddress, protocol } = resp.response as {
        vaultId: number
        type: VaultType
        chainId: NetworkIds
        protocol: LendingProtocol
        ownerAddress: string
      }
      return { vaultId, type, chainId, ownerAddress, protocol }
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
    url: `/api/vault`,
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
  }).pipe(
    map(() => {
      console.info('Vault saved')
    }),
  )
}
