import { NetworkNames } from 'blockchain/networks'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { PositionId } from 'features/aave/types'
import { AaveUserConfigurationResults } from 'lendingProtocols/aave-v2/pipelines'
import { Observable, of } from 'rxjs'

import { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'
import { getStrategyConfig$ } from './getStrategyConfig'

describe('getStrategyConfig', () => {
  const proxiesForPosition$ = jest.fn<Observable<ProxiesRelatedWithPosition>, [PositionId]>()
  const lastCreatedPositionForProxy$ = jest.fn<Observable<PositionCreated | undefined>, [string]>()
  const aaveUserConfiguration$ = jest.fn<Observable<AaveUserConfigurationResults>, [string]>()

  it('should return strategy based on assets when there is not PositionCreated Event', (done) => {
    lastCreatedPositionForProxy$.mockReturnValue(of<PositionCreated | undefined>(undefined))
    proxiesForPosition$.mockReturnValue(
      of({ dsProxy: '0x123', dpmProxy: undefined, walletAddress: '0x123' }),
    )
    aaveUserConfiguration$.mockReturnValue(of(Object.assign([], { hasAssets: () => true })))

    const observable$ = getStrategyConfig$(
      proxiesForPosition$,
      aaveUserConfiguration$,
      lastCreatedPositionForProxy$,
      { walletAddress: '0x123' },
      NetworkNames.ethereumMainnet,
    )

    observable$.subscribe((strategy) => {
      expect(strategy).toBeDefined()
      done()
    })
  })
})
