import { NetworkNames } from 'blockchain/networks'
import type { PositionCreated } from 'features/aave/services'
import type { PositionId } from 'features/aave/types/position-id'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { LendingProtocol } from 'lendingProtocols'
import type { AaveUserConfigurationResults } from 'lendingProtocols/aave-v2/pipelines'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'

import type { AddressesRelatedWithPosition } from './getProxiesRelatedWithPosition'
import { getStrategyConfig$ } from './getStrategyConfig'

describe('getStrategyConfig', () => {
  const proxiesForPosition$ = jest.fn<Observable<AddressesRelatedWithPosition>, [PositionId]>()
  const readPositionCreatedEvents$ = jest.fn<Observable<PositionCreated[]>, [string]>()
  const aaveUserConfiguration$ = jest.fn<Observable<AaveUserConfigurationResults>, [string]>()

  it('should return strategy based on assets when there is not PositionCreated Event', (done) => {
    readPositionCreatedEvents$.mockReturnValue(of<PositionCreated[]>([]))
    proxiesForPosition$.mockReturnValue(
      of({ dsProxy: '0x123', dpmProxy: undefined, walletAddress: '0x123' }),
    )
    aaveUserConfiguration$.mockReturnValue(of(Object.assign([], { hasAssets: () => true })))

    const observable$ = getStrategyConfig$(
      proxiesForPosition$,
      aaveUserConfiguration$,
      readPositionCreatedEvents$,
      { walletAddress: '0x123' },
      NetworkNames.ethereumMainnet,
      VaultType.Earn,
      LendingProtocol.AaveV2,
    )

    observable$.subscribe((strategy) => {
      expect(strategy).toBeDefined()
      done()
    })
  })
})
