import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { of } from 'rxjs'
import sinon from 'sinon'

import { getStateUnpacker } from '../../../helpers/testHelpers'
import { zero } from '../../../helpers/zero'
import { createPositionsOverviewSummary$, Position, PositionView } from './positionsOverviewSummary'

describe('positionsOverviewSummary', () => {
  it('calculates proportions correctly, maps usd, and sorts values', () => {
    const mockBalances = {
      ETH: new BigNumber(1),
      WBTC: new BigNumber(5),
    }

    const walletBalance$ = sinon
      .stub()
      .callsFake((token: keyof typeof mockBalances) => of(mockBalances[token] || zero))

    const tokenPriceUsd$ = sinon.stub().returns(
      of({
        ETH: new BigNumber(2),
        WBTC: new BigNumber(6),
      }),
    )
    const obsv$ = createPositionsOverviewSummary$(
      walletBalance$,
      tokenPriceUsd$,
      () => of([]),
      () => of([{ path: 'url', icon: 'icon', text: 'text' }]),
      '0x00',
    )

    const state = getStateUnpacker(obsv$)

    const wbtc = state().assetsAndPositions[0]
    const eth = state().assetsAndPositions[1]

    expect(wbtc.token, 'orders values by usd').eq('WBTC')
    expect(eth.token, 'orders values by usd').eq('ETH')
    expect(wbtc.contentsUsd?.toString(), 'calculates usd value').eq('30')
    expect(eth.contentsUsd?.toString(), 'calculates usd value').eq('2')
    expect(wbtc.proportion?.toString(), 'calculates proportion').eq('93.75')
    expect(eth.proportion?.toString(), 'calculates proportion').eq('6.25')
  })

  it('calculates the other proportion correctly', () => {
    const mockBalances = {
      ETH: new BigNumber(16),
      WBTC: new BigNumber(5),
      STETH: new BigNumber(5),
      MKR: new BigNumber(5),
      WETH: new BigNumber(5),
      // these two tokens included in 'other' proportion
      BAT: new BigNumber(5),
      RENBTC: new BigNumber(4),
    }

    const walletBalance$ = sinon
      .stub()
      .callsFake((token: keyof typeof mockBalances) => of(mockBalances[token] || zero))

    const tokenPriceUsd$ = sinon.stub().returns(
      of({
        ETH: new BigNumber(1),
        WBTC: new BigNumber(1),
        STETH: new BigNumber(1),
        MKR: new BigNumber(1),
        WETH: new BigNumber(1),
        BAT: new BigNumber(1),
        RENBTC: new BigNumber(1),
      }),
    )
    const obsv$ = createPositionsOverviewSummary$(
      walletBalance$,
      tokenPriceUsd$,
      () => of([]),
      () => of([{ path: 'url', icon: 'icon', text: 'text' }]),
      '0x00',
    )

    const state = getStateUnpacker(obsv$)

    expect(state().percentageOther.toString()).eq('10')
  })

  it('includes the maker positions', () => {
    const mockBalances = {
      ETH: new BigNumber(1),
    }

    const walletBalance$ = sinon
      .stub()
      .callsFake((token: keyof typeof mockBalances) => of(mockBalances[token] || zero))

    const tokenPriceUsd$ = sinon.stub().returns(
      of({
        ETH: new BigNumber(6),
      }),
    )

    const positions: Array<Position> = [
      {
        token: 'ETH',
        title: 'ETH-A Oasis Multiply',
        contentsUsd: new BigNumber(5),
        url: 'example.com/eth',
      },
      {
        token: 'DAI',
        title: 'DAI-A Oasis Earn',
        contentsUsd: new BigNumber(7),
        url: 'example.com/earn',
      },
    ]

    const obsv$ = createPositionsOverviewSummary$(
      walletBalance$,
      tokenPriceUsd$,
      () => of(positions),
      () => of([{ path: 'url', icon: 'icon', text: 'text' }]),
      '0x00',
    )

    const state = getStateUnpacker(obsv$)

    const earnPosition = state().assetsAndPositions[0]
    const ethInWallet = state().assetsAndPositions[1]
    const multiplyPosition = state().assetsAndPositions[2]

    expect(earnPosition.token)

    expect(earnPosition.token).eq('DAI')
    expect(earnPosition.contentsUsd?.toString()).eq('7')
    expect((earnPosition as PositionView).title).eq('DAI-A Oasis Earn')
    expect((earnPosition as PositionView).url).eq('example.com/earn')

    expect(ethInWallet.token).eq('ETH')
    expect(ethInWallet.contentsUsd?.toString()).eq('6')

    expect(multiplyPosition.token).eq('ETH')
    expect(multiplyPosition.contentsUsd?.toString()).eq('5')
    expect((multiplyPosition as PositionView).title).eq('ETH-A Oasis Multiply')
    expect((multiplyPosition as PositionView).url).eq('example.com/eth')

    expect(state().totalValueUsd.toString()).eq('18')
  })
})
