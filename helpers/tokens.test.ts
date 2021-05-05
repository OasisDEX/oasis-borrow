import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'

import { calculateTokenPrecisionByValue } from './tokens'

describe('token input precision calculation', () => {
  it('when token price is between to 1-9.99 USD', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('1'),
      }),
    ).to.deep.equal(2)
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('9.99'),
      }),
    ).to.deep.equal(2)
  })
  it('when token price is <1 USD', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('0.1'),
      }),
    ).to.deep.equal(1)

    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('0.001'),
      }),
    ).to.deep.equal(0)
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('0.00000000001'),
      }),
    ).to.deep.equal(0)
  })

  it('when token price is >1 USD', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('10000'),
      }),
    ).to.deep.equal(6)

    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('1000000000'),
      }),
    ).to.deep.equal(11)
  })

  it('should prefer token precision if magnitude exceeds it', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'WBTC',
        usdPrice: new BigNumber('10000000000000000000'),
      }),
    ).to.deep.equal(8)
  })
})
