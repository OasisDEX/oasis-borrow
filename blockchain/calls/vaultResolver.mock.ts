import { Observable, of } from 'rxjs'

import { MakerVaultType, VaultResolve } from './vaultResolver'

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
