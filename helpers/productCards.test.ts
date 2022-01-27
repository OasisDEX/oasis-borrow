import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { mockPriceInfo$ } from './mocks/priceInfo.mock'
import {
  borrowPageCardsData,
  createProductCardsData$,
  landingPageCardsData,
  multiplyPageCardsData,
} from './productCards'

const wbtcA = mockIlkData({
  token: 'WTBC',
  ilk: 'WBTC-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const wbtcB = mockIlkData({
  token: 'WBTC',
  ilk: 'WBTC-B',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const wbtcC = mockIlkData({
  token: 'WBTC',
  ilk: 'WBTC-C',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const renbtc = mockIlkData({
  token: 'RENBTC',
  ilk: 'RENBTC-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const ethA = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const ethB = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-B',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const ethC = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-C',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const linkA = mockIlkData({
  token: 'LINK',
  ilk: 'LINK-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

const wsteth = mockIlkData({
  token: 'WSTETH',
  ilk: 'WSTETH-A',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
})()

describe('createProductCardsData$', () => {
  it('should return correct product data', () => {
    const state = getStateUnpacker(createProductCardsData$(of([wbtcA]), () => mockPriceInfo$()))

    expect(state()[0]).to.eql({
      background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
      bannerIcon: '/static/img/tokens/wbtc.png',
      bannerGif: '/static/img/tokens/wbtc.gif',
      currentCollateralPrice: new BigNumber(550),
      ilk: 'WBTC-A',
      liquidationRatio: new BigNumber(1.4),
      name: 'Wrapped Bitcoin',
      stabilityFee: new BigNumber(0.045),
      token: 'WBTC',
      isFull: false,
    })
  })

  it('should return correct landing page product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of([wbtcB, ethB, linkA, wsteth]), () => mockPriceInfo$()),
    )

    const landingPageData = landingPageCardsData({ productCardsData: state() })

    expect(landingPageData).to.eql([
      {
        token: wbtcB.token,
        ilk: wbtcB.ilk,
        liquidationRatio: wbtcB.liquidationRatio,
        stabilityFee: wbtcB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
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
        stabilityFee: ethB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: linkA.token,
        ilk: linkA.ilk,
        liquidationRatio: linkA.liquidationRatio,
        stabilityFee: linkA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/link.png',
        bannerGif: '/static/img/tokens/link.gif',
        background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
        name: 'Chainlink',
        isFull: false,
      },
    ])
  })

  it('should return correct multiple page product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of([wbtcB, ethB, linkA, wsteth]), () => mockPriceInfo$()),
    )

    const multiplyPageData = multiplyPageCardsData({
      productCardsData: state(),
      cardsFilter: 'Featured',
    })

    expect(multiplyPageData).to.eql([
      {
        token: wbtcB.token,
        ilk: wbtcB.ilk,
        liquidationRatio: wbtcB.liquidationRatio,
        stabilityFee: wbtcB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
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
        stabilityFee: ethB.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: linkA.token,
        ilk: linkA.ilk,
        liquidationRatio: linkA.liquidationRatio,
        stabilityFee: linkA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/link.png',
        bannerGif: '/static/img/tokens/link.gif',
        background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
        name: 'Chainlink',
        isFull: false,
      },
    ])
  })

  it('should return correct multiple page token product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of([wbtcA, ethA, linkA, wsteth]), () => mockPriceInfo$()),
    )

    const multiplyPageData = multiplyPageCardsData({
      productCardsData: state(),
      cardsFilter: 'ETH',
    })

    expect(multiplyPageData).to.eql([
      {
        token: ethA.token,
        ilk: ethA.ilk,
        liquidationRatio: ethA.liquidationRatio,
        stabilityFee: ethA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: wsteth.token,
        ilk: wsteth.ilk,
        liquidationRatio: wsteth.liquidationRatio,
        stabilityFee: wsteth.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/wstETH.png',
        bannerGif: '/static/img/tokens/wstETH.gif',
        background: 'linear-gradient(158.87deg, #E2F7F9 0%, #D3F3F5 100%), #FFFFFF',
        name: 'WSTETH',
        isFull: false,
      },
    ])
  })

  it('should return correct borrow page product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of([wbtcC, ethA, ethC, linkA, wsteth]), () => mockPriceInfo$()),
    )

    const borrowPageData = borrowPageCardsData({
      productCardsData: state(),
      cardsFilter: 'Featured',
    })

    expect(borrowPageData).to.eql([
      {
        token: wbtcC.token,
        ilk: wbtcC.ilk,
        liquidationRatio: wbtcC.liquidationRatio,
        stabilityFee: wbtcC.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/wbtc.png',
        bannerGif: '/static/img/tokens/wbtc.gif',
        background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
        name: 'Wrapped Bitcoin',
        isFull: false,
      },
      {
        token: ethC.token,
        ilk: ethC.ilk,
        liquidationRatio: ethC.liquidationRatio,
        stabilityFee: ethC.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/eth.png',
        bannerGif: '/static/img/tokens/eth.gif',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        name: 'Ether',
        isFull: false,
      },
      {
        token: linkA.token,
        ilk: linkA.ilk,
        liquidationRatio: linkA.liquidationRatio,
        stabilityFee: linkA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/link.png',
        bannerGif: '/static/img/tokens/link.gif',
        background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
        name: 'Chainlink',
        isFull: false,
      },
    ])
  })

  it('should return correct borrow page token product data', () => {
    const state = getStateUnpacker(
      createProductCardsData$(of([wbtcA, ethA, ethC, linkA, wsteth, renbtc]), () =>
        mockPriceInfo$(),
      ),
    )

    const borrowPageData = borrowPageCardsData({ productCardsData: state(), cardsFilter: 'BTC' })

    expect(borrowPageData).to.eql([
      {
        token: wbtcA.token,
        ilk: wbtcA.ilk,
        liquidationRatio: wbtcA.liquidationRatio,
        stabilityFee: wbtcA.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/wbtc.png',
        bannerGif: '/static/img/tokens/wbtc.gif',
        background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
        name: 'Wrapped Bitcoin',
        isFull: false,
      },
      {
        token: renbtc.token,
        ilk: renbtc.ilk,
        liquidationRatio: renbtc.liquidationRatio,
        stabilityFee: renbtc.stabilityFee,
        currentCollateralPrice: new BigNumber('550'),
        bannerIcon: '/static/img/tokens/renBTC.png',
        bannerGif: '/static/img/tokens/renBTC.gif',
        background: 'linear-gradient(160.47deg, #F1F5F5 0.35%, #E5E7E8 99.18%), #FFFFFF',
        name: 'renBTC',
        isFull: false,
      },
    ])
  })
})
