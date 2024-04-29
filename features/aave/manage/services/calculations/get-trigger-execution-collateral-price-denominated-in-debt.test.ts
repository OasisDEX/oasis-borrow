import BigNumber from 'bignumber.js'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols';
import { LendingProtocol } from 'lendingProtocols'

import { getTriggerExecutionPrice } from './get-trigger-execution-price'

describe('get-trigger-execution-collateral-price-denominated-in-debt', () => {
  it('should return undefined if positionValue or executionTriggerLTV is undefined', () => {
    const positionValue = undefined
    const executionTriggerLTV = undefined
    const result = getTriggerExecutionPrice({
      position: positionValue,
      executionTriggerLTV,
    })
    expect(result).toBe(undefined)
  })
  it('should return 280 when debt is 1400, collateral 10 and executionTriggerLTV 0.5', () => {
    const positionValue = {
      ltv: 0, // doesn't matter for the calculations
      collateral: {
        token: {
          symbol: 'ETH',
          address: '0x0',
          decimals: 18,
        },
        amount: new BigNumber(10),
      },
      debt: {
        token: {
          symbol: 'DAI',
          address: '0x0',
          decimals: 18,
        },
        amount: new BigNumber(1400),
      },
      protocol: LendingProtocol.AaveV3 as AaveLendingProtocol | SparkLendingProtocol,
      dpm: '0x0',
      pricesDenomination: 'collateral' as const,
    }
    const executionTriggerLTV = 50
    const result = getTriggerExecutionPrice({
      position: positionValue,
      executionTriggerLTV,
    })
    expect(result?.price.toNumber()).toEqual(280)
  })
})
