import { BigNumber } from 'bignumber.js'

import { calculateTokenPrecisionByValue } from './tokens'

describe('token input precision calculation', () => {
  it('when token price is between to 1-9.99 USD', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('1'),
      }),
    ).toEqual(2)
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('9.99'),
      }),
    ).toEqual(2)
  })
  it('when token price is <1 USD', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('0.1'),
      }),
    ).toEqual(1)

    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('0.001'),
      }),
    ).toEqual(0)
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('0.00000000001'),
      }),
    ).toEqual(0)
  })

  it('when token price is >1 USD', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('10000'),
      }),
    ).toEqual(6)

    expect(
      calculateTokenPrecisionByValue({
        token: 'ETH',
        usdPrice: new BigNumber('1000000000'),
      }),
    ).toEqual(11)
  })

  it('should prefer token precision if magnitude exceeds it', () => {
    expect(
      calculateTokenPrecisionByValue({
        token: 'WBTC',
        usdPrice: new BigNumber('10000000000000000000'),
      }),
    ).toEqual(8)
  })
})
