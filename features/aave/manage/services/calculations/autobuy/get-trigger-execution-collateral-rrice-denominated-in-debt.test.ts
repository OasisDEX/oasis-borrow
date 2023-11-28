import BigNumber from 'bignumber.js'

import { getTriggerExecutionCollateralPriceDenominatedInDebt } from './get-trigger-execution-collateral-price-denominated-in-debt'

describe('get-trigger-execution-collateral-price-denominated-in-debt', () => {
  it('should return undefined if positionValue or executionTriggerLTV is undefined', () => {
    const positionValue = undefined
    const executionTriggerLTV = undefined
    const result = getTriggerExecutionCollateralPriceDenominatedInDebt({
      position: positionValue,
      executionTriggerLTV,
    })
    expect(result).toBe(undefined)
  })
  it('should return 280 when debt is 1400, collateral 10 and executionTriggerLTV 0.5', () => {
    const positionValue = {
      ltv: 0, // doesn't matter for the calculations
      collateral: {
        symbol: 'ETH',
        amount: new BigNumber(10),
      },
      debt: {
        symbol: 'DAI',
        amount: new BigNumber(1400),
      },
    }
    const executionTriggerLTV = 50
    const result = getTriggerExecutionCollateralPriceDenominatedInDebt({
      position: positionValue,
      executionTriggerLTV,
    })
    expect(result?.toNumber()).toEqual(280)
  })
})
