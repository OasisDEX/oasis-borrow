/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { createFeaturedIlks$ } from '../featuredIlksData'
import { createLanding$ } from '../landing'

describe('Landing', () => {
  it.only('should return popular assets by default', () => {
    const ilkDataList$ = of(
      new Array(20).fill(
        mockIlkData({
          ilk: 'WBTC-A',
          stabilityFee: new BigNumber('0.045'),
        })(),
      ),
    )
    const landing$ = createLanding$(ilkDataList$, createFeaturedIlks$(ilkDataList$))
    const landing = getStateUnpacker(landing$)

    expect(landing().ilks.filters.tagFilter).to.equal('popular')
    expect(landing().ilks.data.length).to.equal(12)
  })
})
