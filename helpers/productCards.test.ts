import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { Observable, of } from 'rxjs'

import { IlkData } from '../blockchain/ilks'
import { OraclePriceData } from '../blockchain/prices'
import {
  borrowPageCardsData,
  createProductCardsData$,
  Ilk,
  ilkToEntryToken,
  landingPageCardsData,
  multiplyPageCardsData,
} from './productCards'

const wbtcA = mockIlkData({
  token: 'WTBC',
  ilk: 'WBTC-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const wbtcB = mockIlkData({
  token: 'WBTC',
  ilk: 'WBTC-B',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const wbtcC = mockIlkData({
  token: 'WBTC',
  ilk: 'WBTC-C',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const renbtc = mockIlkData({
  token: 'RENBTC',
  ilk: 'RENBTC-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const ethA = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const ethB = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-B',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const ethC = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-C',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const linkA = mockIlkData({
  token: 'LINK',
  ilk: 'LINK-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const wstethA = mockIlkData({
  token: 'WSTETH',
  ilk: 'WSTETH-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const wstethB = mockIlkData({
  token: 'WSTETH',
  ilk: 'WSTETH-B',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const guni = mockIlkData({
  token: 'GUNIV3DAIUSDC2',
  ilk: 'GUNIV3DAIUSDC2-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

const crv = mockIlkData({
  token: 'CRVV1ETHSTETH',
  ilk: 'CRVV1ETHSTETH-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()

function mockOraclePriceData$(): Observable<OraclePriceData> {
  return of({
    currentPrice: new BigNumber('550'),
    nextPrice: new BigNumber('2'),
    isStaticPrice: false,
    percentageChange: new BigNumber('0.1'),
  })
}

const mockIlkDataMapping: Record<Ilk, IlkData> = {
  'WBTC-A': wbtcA,
  'WBTC-B': wbtcB,
  'WBTC-C': wbtcC,
  'RENBTC-A': renbtc,
  'ETH-A': ethA,
  'ETH-B': ethB,
  'ETH-C': ethC,
  'LINK-A': linkA,
  'WSTETH-A': wstethA,
  'WSTETH-B': wstethB,
  'GUNIV3DAIUSDC2-A': guni,
  'CRVV1ETHSTETH-A': crv,
}

function mockIlkData$(ilk: string): Observable<IlkData> {
  return of(mockIlkDataMapping[ilk])
}

describe('createProductCardsData$', () => {
  it('should return correct product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of(['WBTC-A']), mockIlkData$, mockOraclePriceData$, ['WBTC-A']),
    )

    expect(state()[0]).to.eql({
      background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
      bannerIcon: '/static/img/tokens/wbtc.png',
      bannerGif: '/static/img/tokens/wbtc.gif',
      currentCollateralPrice: new BigNumber(550),
      ilk: 'WBTC-A',
      liquidationRatio: wbtcA.liquidationRatio,
      liquidityAvailable: wbtcA.ilkDebtAvailable,
      debtFloor: wbtcA.debtFloor,
      name: 'Wrapped Bitcoin',
      stabilityFee: wbtcA.stabilityFee,
      token: 'WBTC',
      isFull: false,
    })
  })

  it('should return correct landing page product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(
        of(['WBTC-B', 'ETH-B', 'WSTETH-A']),
        mockIlkData$,
        mockOraclePriceData$,
        ['WBTC-B', 'ETH-B', 'WSTETH-A'],
      ),
    )

    const landingPageData = landingPageCardsData({ productCardsData: state() })

    expect(landingPageData).to.eql([
      {
        token: wbtcB.token,
        ilk: wbtcB.ilk,
        liquidationRatio: wbtcB.liquidationRatio,
        liquidityAvailable: wbtcB.ilkDebtAvailable,
        stabilityFee: wbtcB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: wbtcB.debtFloor,
        bannerIcon: '/static/img/tokens/wbtc.png',
        bannerGif: '/static/img/tokens/wbtc.gif',
        background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
        name: 'Wrapped Bitcoin',
        isFull: false,
      },
      {
        token: ethB.token,
        ilk: ethB.ilk,
        liquidationRatio: ethB.liquidationRatio,
        liquidityAvailable: ethB.ilkDebtAvailable,
        stabilityFee: ethB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: ethB.debtFloor,
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: wstethA.token,
        ilk: wstethA.ilk,
        liquidationRatio: wstethA.liquidationRatio,
        liquidityAvailable: wstethA.ilkDebtAvailable,
        stabilityFee: wstethA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: wstethA.debtFloor,
        bannerIcon: '/static/img/tokens/wstETH.png',
        bannerGif: '/static/img/tokens/wstETH.gif',
        background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
        name: 'WSTETH',
        isFull: false,
      },
    ])
  })

  it('should return correct multiple page product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(
        of(['WBTC-B', 'ETH-B', 'WSTETH-A']),
        mockIlkData$,
        mockOraclePriceData$,
        ['WBTC-B', 'ETH-B', 'WSTETH-A'],
      ),
    )

    const multiplyPageData = multiplyPageCardsData({
      ilkToTokenMapping: state(),
      cardsFilter: 'Featured',
    })

    expect(multiplyPageData).to.eql([
      {
        token: wbtcB.token,
        ilk: wbtcB.ilk,
        liquidationRatio: wbtcB.liquidationRatio,
        liquidityAvailable: wbtcB.ilkDebtAvailable,
        stabilityFee: wbtcB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: wbtcB.debtFloor,
        bannerIcon: '/static/img/tokens/wbtc.png',
        bannerGif: '/static/img/tokens/wbtc.gif',
        background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
        name: 'Wrapped Bitcoin',
        isFull: false,
      },
      {
        token: ethB.token,
        ilk: ethB.ilk,
        liquidationRatio: ethB.liquidationRatio,
        liquidityAvailable: ethB.ilkDebtAvailable,
        stabilityFee: ethB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: ethB.debtFloor,
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: wstethA.token,
        ilk: wstethA.ilk,
        liquidationRatio: wstethA.liquidationRatio,
        liquidityAvailable: wstethA.ilkDebtAvailable,
        stabilityFee: wstethA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: wstethA.debtFloor,
        bannerIcon: '/static/img/tokens/wstETH.png',
        bannerGif: '/static/img/tokens/wstETH.gif',
        background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
        name: 'WSTETH',
        isFull: false,
      },
    ])
  })

  it('should return correct multiple page token product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of(['ETH-A', 'WSTETH-A']), mockIlkData$, mockOraclePriceData$, [
        'ETH-A',
        'WSTETH-A',
      ]),
    )

    const multiplyPageData = multiplyPageCardsData({
      ilkToTokenMapping: state(),
      cardsFilter: 'ETH',
    })

    expect(multiplyPageData).to.eql([
      {
        token: ethA.token,
        ilk: ethA.ilk,
        liquidationRatio: ethA.liquidationRatio,
        liquidityAvailable: ethA.ilkDebtAvailable,
        stabilityFee: ethA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: ethA.debtFloor,
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: wstethA.token,
        ilk: wstethA.ilk,
        liquidationRatio: wstethA.liquidationRatio,
        liquidityAvailable: wstethA.ilkDebtAvailable,
        stabilityFee: wstethA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: wstethA.debtFloor,
        bannerIcon: '/static/img/tokens/wstETH.png',
        bannerGif: '/static/img/tokens/wstETH.gif',
        background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
        name: 'WSTETH',
        isFull: false,
      },
    ])
  })

  it('maps one product card correctly', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of(['WBTC-C']), mockIlkData$, mockOraclePriceData$, ['WBTC-C']),
    )

    const borrowPageData = borrowPageCardsData({
      ilkToTokenMapping: state(),
      cardsFilter: 'Featured',
    })

    expect(borrowPageData[0]).to.eql({
      token: wbtcC.token,
      ilk: wbtcC.ilk,
      liquidationRatio: wbtcC.liquidationRatio,
      liquidityAvailable: wbtcC.ilkDebtAvailable,
      stabilityFee: wbtcC.stabilityFee,
      currentCollateralPrice: new BigNumber('550'),
      debtFloor: wbtcC.debtFloor,
      bannerIcon: '/static/img/tokens/wbtc.png',
      bannerGif: '/static/img/tokens/wbtc.gif',
      background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
      name: 'Wrapped Bitcoin',
      isFull: false,
    })
  })

  it('sorts and filters product cards', () => {
    const state = getStateUnpacker(
      createProductCardsData$(
        of(['WBTC-C', 'ETH-C', 'WSTETH-B', 'CRVV1ETHSTETH-A']),
        mockIlkData$,
        mockOraclePriceData$,
        ['WBTC-C', 'ETH-C', 'WSTETH-B', 'CRVV1ETHSTETH-A'],
      ),
    )

    const borrowPageData = borrowPageCardsData({
      ilkToTokenMapping: state(),
      cardsFilter: 'Featured',
    })

    expect(borrowPageData[0].ilk).to.eql(wbtcC.ilk)
    expect(borrowPageData[1].ilk).to.eql(ethC.ilk)
    expect(borrowPageData[2].ilk).to.eql(wstethB.ilk)
    expect(borrowPageData[3].ilk).to.eql(crv.ilk)
  })

  it('should return correct borrow page token product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of(['RENBTC-A', 'WBTC-A']), mockIlkData$, mockOraclePriceData$, [
        'RENBTC-A',
        'WBTC-A',
      ]),
    )

    const borrowPageData = borrowPageCardsData({ ilkToTokenMapping: state(), cardsFilter: 'BTC' })

    expect(borrowPageData).to.eql([
      {
        token: renbtc.token,
        ilk: renbtc.ilk,
        liquidationRatio: renbtc.liquidationRatio,
        liquidityAvailable: renbtc.ilkDebtAvailable,
        stabilityFee: renbtc.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: renbtc.debtFloor,
        bannerIcon: '/static/img/tokens/renBTC.png',
        bannerGif: '/static/img/tokens/renBTC.gif',
        background: 'linear-gradient(160.47deg, #F1F5F5 0.35%, #E5E7E8 99.18%), #FFFFFF',
        name: 'renBTC',
        isFull: false,
      },
      {
        token: wbtcA.token,
        ilk: wbtcA.ilk,
        liquidationRatio: wbtcA.liquidationRatio,
        liquidityAvailable: wbtcA.ilkDebtAvailable,
        stabilityFee: wbtcA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        debtFloor: wbtcA.debtFloor,
        bannerIcon: '/static/img/tokens/wbtc.png',
        bannerGif: '/static/img/tokens/wbtc.gif',
        background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
        name: 'Wrapped Bitcoin',
        isFull: false,
      },
    ])
  })

  it('should custom sort the cards', () => {
    const borrowPageData = borrowPageCardsData({
      ilkToTokenMapping: ilkToEntryToken,
      cardsFilter: 'ETH',
    })

    expect(borrowPageData[0].ilk).to.eql(ethC.ilk)
    expect(borrowPageData[1].ilk).to.eql(ethA.ilk)
    expect(borrowPageData[2].ilk).to.eql(wstethA.ilk)
    expect(borrowPageData[3].ilk).to.eql(ethB.ilk)

    const multiplyCardData = multiplyPageCardsData({
      ilkToTokenMapping: ilkToEntryToken,
      cardsFilter: 'BTC',
    })

    expect(multiplyCardData[0].ilk).to.eql(wbtcB.ilk)
    expect(multiplyCardData[1].ilk).to.eql(wbtcA.ilk)
    expect(multiplyCardData[2].ilk).to.eql(renbtc.ilk)
    expect(multiplyCardData[3].ilk).to.eql(wbtcC.ilk)
  })
})
