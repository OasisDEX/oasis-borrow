import type { Vault } from '@prisma/client'
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

export interface ApiVault {
  vaultId: number
  chainId: NetworkIds
  protocol: LendingProtocol
  ownerAddress: string
  type: VaultType
  tokenPair: string
}

interface ApiVaultFallback {
  type: VaultType.Borrow
}

export interface ApiVaultsParams {
  vaultIds: number[]
  chainId: NetworkIds
  protocol: LendingProtocol
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
        tokenPair: vault.token_pair,
      }
    }) ?? []
  )
}

export interface ApiVaultParams {
  vaultId: number
  chainId: NetworkIds
  protocol: LendingProtocol
  tokenPair: string
}

export async function getApiVault({
  vaultId,
  protocol,
  chainId,
  tokenPair,
}: ApiVaultParams): Promise<ApiVault | undefined> {
  try {
    const data = await fetch(`/api/vault/${vaultId}/${chainId}/${protocol}/${tokenPair}`)

    const vault: ApiVault = await data.json()

    return vault.vaultId ? vault : undefined
  } catch (e) {
    console.error(`Can't obtain vault from API`, e)
    return undefined
  }
}

export function getVaultFromApi$(
  vaultId: number,
  chainId: number,
  protocol: LendingProtocol,
): Observable<ApiVault | ApiVaultFallback> {
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
      if (!resp.response.type) {
        return {
          type: VaultType.Borrow,
        }
      }

      const { vaultId, type, chainId, ownerAddress, protocol, tokenPair } = resp.response as {
        vaultId: number
        type: VaultType
        chainId: NetworkIds
        protocol: LendingProtocol
        ownerAddress: string
        tokenPair: string
      }
      return { vaultId, type, chainId, ownerAddress, protocol, tokenPair }
    }),
  )
}

export function saveVaultUsingApi$(
  id: BigNumber,
  token: string,
  vaultType: VaultType,
  chainId: number,
  protocol: string,
  tokenPair?: string,
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
      tokenPair: (tokenPair || '').toUpperCase(),
    },
  }).pipe(
    map(() => {
      console.info('Vault saved')
    }),
  )
}
