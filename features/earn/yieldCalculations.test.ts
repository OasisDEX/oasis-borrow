import BigNumber from 'bignumber.js'
import { expect } from 'chai'

import { amountFromRay } from '../../blockchain/utils'
import { SECONDS_PER_YEAR } from '../../components/constants'
import { calculateYield } from './yieldCalculations'

describe('Yield Calculations', async () => {
  const stabilityFee = amountFromRay(new BigNumber('1000000000015850933588756013'))
    .pow(SECONDS_PER_YEAR)
    .minus(1)

  const multiply = new BigNumber(50)

  const precision = 6

  it('Should return correct value for 7 days period', () => {
    const startPrice = new BigNumber('202.157596054852200175')
    const endPrice = new BigNumber('202.164207670283362946')

    const result = calculateYield(startPrice, endPrice, stabilityFee, 7, multiply)

    const expected = new BigNumber('0.060767268119203480765725028777122528')

    expect(result.toFixed(precision)).to.be.eq(expected.toFixed(precision))
  })

  it('Should return correct value for 30 days period', () => {
    const startPrice = new BigNumber('202.077662061032449692')
    const endPrice = new BigNumber('202.164207670283362946')

    const result = calculateYield(startPrice, endPrice, stabilityFee, 30, multiply)

    const expected = new BigNumber('0.236036362226332613195601087768901528')

    expect(result.toFixed(precision)).to.be.eq(expected.toFixed(precision))
  })
})
