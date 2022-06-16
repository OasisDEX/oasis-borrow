import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { VaultWithType } from '../../../blockchain/vaults'
import { Position } from './positionsOverviewSummary'

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

export function createPositions$(
  createMakerVaults$: (address: string) => Observable<VaultWithType[]>,
  address: string,
): Observable<Position[]> {
  return createMakerVaults$(address).pipe(
    map((vaults: Array<VaultWithType>) => {
      return vaults.map((vault) => {
        return {
          token: vault.token,
          contentsUsd: vault.lockedCollateralUSD.minus(vault.debt),
          title: makerPositionName(vault),
          url: `/${vault.id}`,
        }
      })
    }),
  )
}
