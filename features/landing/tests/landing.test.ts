/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { createLanding$ } from '../landing'

describe('Landing', () => {
  function prepareIlkDataList$() {
    return of([
      mockIlkData({
        ilk: 'USDC-NO-DEBT-AVAILABLE',
        debtCeiling: new BigNumber(10),
        ilkDebt: new BigNumber(10),
        token: 'ETH',
      })(),
      mockIlkData({
        ilk: 'ETH-MOST-POPULAR',
        debtCeiling: new BigNumber(200),
        ilkDebt: new BigNumber(100),
        token: 'ETH',
      })(),
      ...new Array(20).fill(
        mockIlkData({
          ilk: 'ETH-A',
          debtCeiling: new BigNumber(20),
          ilkDebt: new BigNumber(10),
          token: 'ETH',
        })(),
      ), // make additional 20 copies of ilks
      mockIlkData({
        ilk: 'UNIV2DAIUSDC-LP-TOKEN',
        debtCeiling: new BigNumber(200),
        ilkDebt: new BigNumber(100),
        token: 'UNIV2DAIUSDC',
      })(),
    ])
  }

  function prepareIlksPerToken$() {
    return of({
      ETH: [
        mockIlkData({
          ilk: 'ETH-A',
          debtCeiling: new BigNumber(1000),
          ilkDebt: new BigNumber(900),
          token: 'ETH',
        })(),
        mockIlkData({
          ilk: 'ETH-B',
          debtCeiling: new BigNumber(1000),
          ilkDebt: new BigNumber(900),
          token: 'ETH',
        })(),
        mockIlkData({
          ilk: 'ETH-C',
          debtCeiling: new BigNumber(200),
          ilkDebt: new BigNumber(100),
          token: 'ETH',
        })(),
      ],
      WBTC: [
        mockIlkData({
          ilk: 'WBTC-A',
          debtCeiling: new BigNumber(200),
          ilkDebt: new BigNumber(100),
          token: 'WBTC',
        })(),
      ],
      'UNI LP Tokens': [
        mockIlkData({
          ilk: 'UNIV2DAIETH-A',
          debtCeiling: new BigNumber(200),
          ilkDebt: new BigNumber(100),
          token: 'UNIV2DAIETH-A',
        })(),
        mockIlkData({
          ilk: '"UNIV2WBTCETH-A"',
          debtCeiling: new BigNumber(200),
          ilkDebt: new BigNumber(100),
          token: 'UNIV2DAIETH-A',
        })(),
        mockIlkData({
          ilk: '"UNIV2USDCETH-A"',
          debtCeiling: new BigNumber(200),
          ilkDebt: new BigNumber(100),
          token: 'UNIV2DAIETH-A',
        })(),
      ],
    })
  }

  let ilkDataList$ = prepareIlkDataList$()
  let ilksPerToken$ = prepareIlksPerToken$()

  beforeEach(() => {
    ilkDataList$ = prepareIlkDataList$()
    ilksPerToken$ = prepareIlksPerToken$()
  })

  it('should return newest and popular assets', () => {
    const landing$ = createLanding$(ilkDataList$, ilksPerToken$)
    const landing = getStateUnpacker(landing$)

    expect(landing().newest).to.have.property('UNI LP Tokens')
    expect(landing().popular).to.have.property('ETH')
  })
})
