import { expect } from 'chai'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockPriceInfo$ } from 'helpers/mocks/priceInfo.mock'
import { mockVault$ } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one } from 'helpers/zero'
import { of } from 'rxjs/internal/observable/of'

import { createVaultsBanners$ } from './vaultsBanners'

describe('createVaultBanners$', () => {
  it('should assign liquidated banner', () => {
    const state = getStateUnpacker(
      createVaultsBanners$(
        of(mockContextConnected),
        () => mockPriceInfo$(),
        () => mockVault$(),
        () => of([]),
        one,
      ),
    )
    expect(state().banner).to.be.eq('ownership')
  })
})
