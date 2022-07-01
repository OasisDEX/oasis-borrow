import BigNumber from 'bignumber.js'
import { expect } from 'chai'

import { amountFromRay } from '../../blockchain/utils'
import { SECONDS_PER_YEAR } from '../../components/constants'
import { calculateBreakeven } from '../../helpers/earn/calculations'
import { calculateEarnings } from '../../helpers/earn/calculations'
import { calculateYield } from '../../helpers/earn/calculations'

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

describe('Breakeven Calculations', async () => {
  const precision = 6

  it('Should return correct breakeven amount', () => {
    const depositAmount = new BigNumber(100000)
    const apy = new BigNumber(0.1) // 10%
    const entryFees = new BigNumber(4000)

    const result = calculateBreakeven({ depositAmount, entryFees, apy })
    const expected = new BigNumber(146.0) // days

    expect(result.toFixed(precision)).to.be.eq(expected.toFixed(precision))
  })
})

describe('Earnings Calculations', async () => {
  const precision = 6

  it('Should return correct earnings and net value positions', () => {
    const depositAmount = new BigNumber(100000)
    const apy = new BigNumber(0.1) // 10%
    const days = new BigNumber(30)

    const { netValue: result } = calculateEarnings({ depositAmount, apy, days })

    const expected = new BigNumber(100821.917808)

    expect(result.toFixed(precision)).to.be.eq(expected.toFixed(precision))
  })
})
