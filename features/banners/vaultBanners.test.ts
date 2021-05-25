import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockPriceInfo$ } from 'helpers/mocks/priceInfo.mock'
import { mockVault$ } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one } from 'helpers/zero'
import moment from 'moment'
import { of } from 'rxjs/internal/observable/of'

import { createVaultsBanners$ } from './vaultsBanners'

describe('createVaultBanners$', () => {
  it('should assign ownership banner', () => {
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

  it('should assign liquidatingNextPrice banner', () => {
    const priceInfo$ = mockPriceInfo$({
      token: 'ETH',
      ethPrice: new BigNumber(200),
      ethChangePercentage: new BigNumber('-0.8'),
    })
    const priceInfo = getStateUnpacker(priceInfo$)
    const state = getStateUnpacker(
      createVaultsBanners$(
        of(mockContextConnected),
        () => priceInfo$,
        () =>
          mockVault$({
            debt: new BigNumber(200),
            collateral: new BigNumber(2),
            ilk: 'ETH',
            priceInfo: priceInfo(),
          }),
        () => of([]),
        one,
      ),
    )
    expect(state().banner).to.be.eq('liquidatingNextPrice')
  })

  it('should assign liquidating banner', () => {
    const state = getStateUnpacker(
      createVaultsBanners$(
        of(mockContextConnected),
        () => mockPriceInfo$(),
        () =>
          mockVault$({
            debt: new BigNumber(1000),
            collateral: new BigNumber(1),
            ilk: 'ETH',
          }),
        () => of([]),
        one,
      ),
    )
    expect(state().banner).to.be.eq('liquidating')
  })

  it('should assign liquidated banner', () => {
    const state = getStateUnpacker(
      createVaultsBanners$(
        of(mockContextConnected),
        () => mockPriceInfo$(),
        () => mockVault$(),
        () =>
          of<VaultHistoryEvent[]>([
            {
              kind: 'AUCTION_STARTED',
              auctionId: '1',
              collateralAmount: new BigNumber(1),
              daiAmount: new BigNumber(1),
              hash: '0x00',
              id: '1',
              timestamp: moment().toISOString(),
              token: 'ETH',
            },
          ]),
        one,
      ),
    )
    expect(state().banner).to.be.eq('liquidated')
  })

  it('should not assign liquidated banner for vault liquidated more than week earlier', () => {
    const state = getStateUnpacker(
      createVaultsBanners$(
        of(mockContextConnected),
        () => mockPriceInfo$(),
        () => mockVault$(),
        () =>
          of<VaultHistoryEvent[]>([
            {
              kind: 'AUCTION_STARTED',
              auctionId: '1',
              collateralAmount: new BigNumber(1),
              daiAmount: new BigNumber(1),
              hash: '0x00',
              id: '1',
              timestamp: moment().subtract(1.5, 'weeks').toISOString(),
              token: 'ETH',
            },
          ]),
        one,
      ),
    )
    expect(state().banner).to.be.eq('ownership')
  })
})
