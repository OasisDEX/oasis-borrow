import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { mockPriceInfo$ } from './mocks/priceInfo.mock'
import { createProductCardsData$ } from './productCards'

const wbtc = mockIlkData({
  token: 'WTBC',
  ilk: 'WBTC-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const expectedOutput = {
  background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
  bannerIcon: '/static/img/tokens/wbtc.png',
  currentCollateralPrice: new BigNumber(550),
  ilk: 'WBTC-A',
  liquidationRatio: new BigNumber(1.4),
  name: 'Wrapped Bitcoin',
  stabilityFee: new BigNumber(0.045),
  token: 'WBTC',
}

describe('createProductCardsData$', () => {
  it('should return correct product data', () => {
    const state = getStateUnpacker(createProductCardsData$(of([wbtc]), () => mockPriceInfo$()))

    expect(state()[0]).to.eql(expectedOutput)
  })
})
