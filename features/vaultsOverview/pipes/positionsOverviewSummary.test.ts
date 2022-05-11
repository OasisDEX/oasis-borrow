import { expect } from 'chai'
import sinon from 'sinon'
import { createPositionsOverviewSummary$ } from './positionsOverviewSummary'
import { of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { getStateUnpacker } from '../../../helpers/testHelpers'
import { zero } from '../../../helpers/zero'

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
    const obsv$ = createPositionsOverviewSummary$(walletBalance$, tokenPriceUsd$, '0x00')

    const state = getStateUnpacker(obsv$)

    const wbtc = state().assetsAndPositions[0]
    const eth = state().assetsAndPositions[1]

    expect(wbtc.token, 'orders values by usd').eq('WBTC')
    expect(eth.token, 'orders values by usd').eq('ETH')
    expect(wbtc.valueUSD?.toString(), 'calculates usd value').eq('30')
    expect(eth.valueUSD?.toString(), 'calculates usd value').eq('2')
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
    const obsv$ = createPositionsOverviewSummary$(walletBalance$, tokenPriceUsd$, '0x00')

    const state = getStateUnpacker(obsv$)

    expect(state().percentageOther.toString()).eq('10')
  })
  it('includes the maker positions')
})
