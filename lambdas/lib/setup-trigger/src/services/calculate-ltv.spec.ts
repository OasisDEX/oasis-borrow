import { calculateLtv } from './calculate-ltv'
import { PRICE_DECIMALS, TokenBalance } from '../types'

describe('calculateLTV', () => {
  it(`should return value of 50% where 1% is 100`, () => {
    const expectedResult = 5000n
    const collateral: TokenBalance = {
      balance: 10n * 10n ** 18n,
      token: {
        decimals: 18,
        symbol: 'WETH',
        address: '0x0',
      },
    }
    const debt: TokenBalance = {
      balance: 14_000n * 10n ** 6n,
      token: {
        decimals: 6,
        symbol: 'USDC',
        address: '0x1',
      },
    }
    const collateralPriceInDebt = 2800n * 10n ** PRICE_DECIMALS

    const result = calculateLtv({ collateral, debt, collateralPriceInDebt })
    expect(result).toEqual(expectedResult)
  })
  it('should return ltv with 2 decimals', () => {
    const expectedResult = 3333n
    const collateral: TokenBalance = {
      balance: 10n * 10n ** 18n,
      token: {
        decimals: 18,
        symbol: 'WETH',
        address: '0x0',
      },
    }
    const debt: TokenBalance = {
      balance: 10_000n * 10n ** 6n,
      token: {
        decimals: 6,
        symbol: 'USDC',
        address: '0x1',
      },
    }
    const collateralPriceInDebt = 3_000n * 10n ** PRICE_DECIMALS

    const result = calculateLtv({ collateral, debt, collateralPriceInDebt })
    expect(result).toEqual(expectedResult)
  })

  // {"level":"DEBUG","message":"Position data","service":"setupTriggerFunction","timestamp":"2023-12-08T15:09:30.831Z","debt":{"balance":"38926749903","token":{"decimals":6,"symbol":"USDC","address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}},"collateral":{"balance":"28876452888028633405","token":{"decimals":18,"symbol":"WETH","address":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}},"collateralPriceInDebt":"2374","ltv":"5678368668"}
  it('should calculate LTV on real example', () => {
    const expectedResult = 5678n
    const collateral: TokenBalance = {
      balance: 28_876_452_888_028_633_405n,
      token: {
        decimals: 18,
        symbol: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
    }
    const debt: TokenBalance = {
      balance: 38_926_749_903n,
      token: {
        decimals: 6,
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
    }
    const collateralPriceInDebt = 2374n * 10n ** PRICE_DECIMALS

    const result = calculateLtv({ collateral, debt, collateralPriceInDebt })
    expect(result).toEqual(expectedResult)
  })
})
