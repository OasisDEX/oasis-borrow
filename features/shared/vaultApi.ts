import type BigNumber from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import type { MultiplyPillChange } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { LendingProtocol } from 'lendingProtocols'
import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest, EMPTY } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

export function checkVaultTypeUsingApi$(
  context$: Observable<Context>,
  pillChange: Observable<MultiplyPillChange>,
  positionInfo: { id: BigNumber; protocol: LendingProtocol; owner: string },
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
        positionInfo.owner,
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

export interface ApiVaultParams {
  vaultId: number
  owner: string
  chainId: NetworkIds
  protocol: LendingProtocol
  tokenPair: string
}

export type GetApiVault = (params: ApiVaultParams) => Promise<ApiVault | undefined>

export async function getApiVault({
  vaultId,
  protocol,
  chainId,
  tokenPair,
  owner,
}: ApiVaultParams): Promise<ApiVault | undefined> {
  try {
    const data = await fetch(`/api/vault/${vaultId}/${owner}/${chainId}/${protocol}/${tokenPair}`)

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
  owner: string,
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
    url: `/api/vault/${vaultId}/${owner}/${chainId}/${protocol.toLowerCase()}`,
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
