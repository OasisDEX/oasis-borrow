import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { calculatePNL } from 'helpers/multiply/calculations'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

import { MockedEvents } from './testTypes'

// based on https://docs.google.com/spreadsheets/d/144cmXYXe89tzjUOrgj8eK7B2pU2WSQBdZr6s1GeXnms/edit#gid=0
const mockedMultiplyEvents: MockedEvents[] = [
  {
    kind: 'OPEN_MULTIPLY_VAULT',
    deposit: new BigNumber(10),
    bought: zero,
    marketPrice: new BigNumber(2000),
    oraclePrice: new BigNumber(2000),
    gasFee: new BigNumber(0.01),
  },
  {
    kind: 'INCREASE_MULTIPLY',
    deposit: zero,
    bought: new BigNumber(5),
    marketPrice: new BigNumber(2000),
    oraclePrice: new BigNumber(2000),
    gasFee: new BigNumber(0.0375),
  },
  {
    kind: 'INCREASE_MULTIPLY',
    deposit: new BigNumber(5),
    bought: zero,
    marketPrice: new BigNumber(2700),
    oraclePrice: new BigNumber(2700),
    gasFee: new BigNumber(0.00925),
  },
  {
    kind: 'INCREASE_MULTIPLY',
    deposit: zero,
    bought: new BigNumber(7),
    marketPrice: new BigNumber(2700),
    oraclePrice: new BigNumber(2700),
    gasFee: new BigNumber(0.02225),
  },
  {
    kind: 'DECREASE_MULTIPLY',
    withdrawn: new BigNumber(2),
    sold: zero,
    marketPrice: new BigNumber(2705),
    oraclePrice: new BigNumber(2705),
    gasFee: new BigNumber(0.011),
  },
  {
    kind: 'GENERATE_DAI',
    generated: new BigNumber(1000),
    marketPrice: new BigNumber(2650),
    gasFee: new BigNumber(0.0075),
  },
  {
    kind: 'DECREASE_MULTIPLY',
    withdrawn: zero,
    sold: new BigNumber(5),
    marketPrice: new BigNumber(2650),
    oraclePrice: new BigNumber(2650),
    gasFee: new BigNumber(0.02825),
  },
]

describe('Multiply calculations', () => {
  it.only('Calculates PNL correctly', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('20'),
          debt: new BigNumber('16680'),
        },
        priceInfo: {
          ethPrice: new BigNumber('2650'),
          collateralPrice: new BigNumber('2650'),
        },
        exchangeQuote: {
          marketPrice: new BigNumber('2650'),
        },
      }),
    )

    const pnl = calculatePNL(mockedMultiplyEvents, state().netValueUSD)
    // console.log(pnl.toFixed())

    expect(pnl).to.be.deep.equal(new BigNumber('0.26643156716417910448'))
  })
})
