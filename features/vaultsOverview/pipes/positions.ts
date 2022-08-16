import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { VaultWithType, VaultWithValue } from '../../../blockchain/vaults'
import { Position } from './positionsOverviewSummary'
import BigNumber from 'bignumber.js'

function makerPositionName(vault: VaultWithType): string {
  if (isMakerEarnPosition(vault)) {
    return `${vault.ilk} Oasis Earn`
  } else if (vault.type === 'borrow') {
    return `${vault.ilk} Oasis Borrow`
  } else {
    return `${vault.ilk} Oasis Multiply`
  }
}

export function isMakerEarnPosition(vault: VaultWithType): boolean {
  return (
    vault.type === 'multiply' &&
    (vault.token === 'GUNIV3DAIUSDC1' || vault.token === 'GUNIV3DAIUSDC2')
  )
}

export function createMakerPositions$(
  vaultsWithValue$: (address: string) => Observable<VaultWithValue<VaultWithType>[]>,
  address: string,
): Observable<Position[]> {
  return vaultsWithValue$(address).pipe(
    map((vaults) => {
      return vaults.map((vault) => {
        return {
          token: vault.token,
          contentsUsd: vault.value,
          title: makerPositionName(vault),
          url: `/${vault.id}`,
        }
      })
    }),
  )
}

export function createAavePositions$(
  userReserveData$: ({
    token,
    proxyAddress,
  }: {
    token: string
    proxyAddress: string
  }) => Observable<{ currentATokenBalance: BigNumber }>,
  collateralTokens$: Observable<string[]>,
  getUserProxyAddress$: (userAddress: string) => Observable<string | undefined>,
  address: string,
): Observable<Position[]> {
  return combineLatest(collateralTokens$, getUserProxyAddress$(address)).pipe(
    map(([tokens, proxyAddress]) => {
      if (!proxyAddress) return []
      return combineLatest(
        tokens.map((token) => {
          return userReserveData$({
            token,
            proxyAddress,
          }).pipe(
            map((userReserve) => {
              console.log('userReserve', userReserve)
              return {
                token: token,
                contentsUsd: new BigNumber(userReserve.currentATokenBalance),
                title: `${token} Aave `,
                url: `/earn/steth/${address}`,
              }
            }),
          )
        }),
      )
    }),
    switchMap((input) => {
      return input
    }),
  )
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position[]>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aavePositions$ = aavePositions$(address)
  return combineLatest([_makerPositions$, _aavePositions$]).pipe(
    map(([makerPositions, aavePositions]) => {
      return makerPositions.concat(aavePositions)
    }),
  )
}
