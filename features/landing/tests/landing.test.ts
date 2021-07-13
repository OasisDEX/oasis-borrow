/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { createFeaturedIlks$ } from '../featuredIlksData'
import { createLanding$ } from '../landing'

describe('Landing', () => {
  function prepareIlkDataList$() {
    return of([
      mockIlkData({
        ilk: 'USDC-NO-DEBT-AVAILABLE',
        debtCeiling: new BigNumber(10),
        ilkDebt: new BigNumber(10),
      })(),
      mockIlkData({
        ilk: 'ETH-MOST-POPULAR',
        debtCeiling: new BigNumber(200),
        ilkDebt: new BigNumber(100),
      })(),
      ...new Array(20).fill(
        mockIlkData({
          ilk: 'ETH-A',
          debtCeiling: new BigNumber(20),
          ilkDebt: new BigNumber(10),
        })(),
      ), // make additional 20 copies of ilks
      mockIlkData({
        ilk: 'UNIV2DAIUSDC-LP-TOKEN',
        debtCeiling: new BigNumber(200),
        ilkDebt: new BigNumber(100),
      })(),
    ])
  }

  let ilkDataList$ = prepareIlkDataList$()

  beforeEach(() => (ilkDataList$ = prepareIlkDataList$()))

  it('should return popular assets by default', () => {
    const landing$ = createLanding$(ilkDataList$, createFeaturedIlks$(ilkDataList$))
    const landing = getStateUnpacker(landing$)

    expect(landing().ilks.filters.tagFilter).to.equal('popular')
    expect(landing().ilks.data.length).to.equal(12)
  })

  it('should be able to filter by tag', () => {
    const landing$ = createLanding$(ilkDataList$, createFeaturedIlks$(ilkDataList$))
    const landing = getStateUnpacker(landing$)

    landing().ilks.filters.change({ kind: 'tagFilter', tagFilter: 'lp-token' })
    expect(landing().ilks.data[0].ilk).to.equal('UNIV2DAIUSDC-LP-TOKEN')
  })
})
