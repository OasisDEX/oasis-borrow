import type { Observable } from 'rxjs'
import { of } from 'rxjs'

import type { VaultResolve } from './vaultResolver'
import { MakerVaultType } from './vaultResolver'

export function createMockVaultResolver$(args?: Partial<VaultResolve>): Observable<VaultResolve> {
  return of({
    ilk: 'ETH-A',
    owner: '0xVaultOwner',
    controller: '0xUserAddress',
    urnAddress: '0xVaultUrnAddress',
    type: MakerVaultType.STANDARD,
    ...args,
  })
}
