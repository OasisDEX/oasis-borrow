import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { calculatePNL } from 'helpers/multiply/calculations'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

import { TestEvents } from './testTypes'

const multiplyEvents: TestEvents[] = [
  {
    kind: 'OPEN_MULTIPLY_VAULT',
    deposit: new BigNumber(10),
    bought: zero,
    marketPrice: new BigNumber(2000),
    oraclePrice: new BigNumber(2000),
    gasFee: new BigNumber(20),
  },
  {
    kind: 'INCREASE_MULTIPLY',
    deposit: zero,
    bought: new BigNumber(5),
    marketPrice: new BigNumber(2000),
    oraclePrice: new BigNumber(2000),
    gasFee: new BigNumber(75),
  },
  {
    kind: 'INCREASE_MULTIPLY',
    deposit: new BigNumber(5),
    bought: zero,
    marketPrice: new BigNumber(2700),
    oraclePrice: new BigNumber(2700),
    gasFee: new BigNumber(25),
  },
  {
    kind: 'INCREASE_MULTIPLY',
    deposit: zero,
    bought: new BigNumber(7),
    marketPrice: new BigNumber(2700),
    oraclePrice: new BigNumber(2700),
    gasFee: new BigNumber(60),
  },
  {
    kind: 'DECREASE_MULTIPLY',
    withdrawn: new BigNumber(2),
    sold: zero,
    marketPrice: new BigNumber(2705),
    oraclePrice: new BigNumber(2705),
    gasFee: new BigNumber(30),
  },
  {
    kind: 'GENERATE_DAI',
    generated: new BigNumber(1000),
    gasFee: new BigNumber(20),
  },
  {
    kind: 'DECREASE_MULTIPLY',
    withdrawn: zero,
    sold: new BigNumber(5),
    marketPrice: new BigNumber(2650),
    oraclePrice: new BigNumber(2650),
    gasFee: new BigNumber(75),
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

    console.log(state().vault.lockedCollateralUSD.toFixed())
    console.log(state().vault.lockedCollateral.toFixed())
    console.log(state().vault.debt.toFixed())
    console.log(state().priceInfo.currentCollateralPrice.toFixed())

    const pnl = calculatePNL(multiplyEvents, state().netValueUSD)
    console.log(pnl.toFixed())
  })
})
