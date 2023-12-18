import { calculateCollateralPriceInDebtBasedOnLtv } from './calculate-collateral-price-in-debt-based-on-ltv'
import { PRICE_DECIMALS } from '../types'

describe('calculateExecutionPrice', () => {
  it('should return value greater than 0', () => {
    const result = calculateCollateralPriceInDebtBasedOnLtv({
      collateral: {
        balance: 10n * 10n ** 18n,
        token: {
          decimals: 18,
          symbol: 'WETH',
          address: '0x0',
        },
      },
      debt: {
        balance: 14_000n * 10n ** 6n,
        token: {
          decimals: 6,
          symbol: 'USDC',
          address: '0x1',
        },
      },
      ltv: 5000n,
      address: '0x2',
    })
    expect(result).toBe(2_800n * 10n ** PRICE_DECIMALS)
  })
})
