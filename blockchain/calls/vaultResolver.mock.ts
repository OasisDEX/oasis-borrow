import { MakerVaultType, VaultResolve } from 'blockchain/calls/vaultResolver'
import { Observable, of } from 'rxjs'

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
