import BigNumber from 'bignumber.js'
import { expect } from 'chai'

import { mockManageMultiplyVault$ } from '../../../../helpers/mocks/manageMultiplyVault.mock'
import { calculatePNL } from '../../../../helpers/multiply/calculations'
import { mockedMultiplyEvents } from '../../../../helpers/multiply/calculations.test'
import { getStateUnpacker } from '../../../../helpers/testHelpers'

describe('Multiply calculations', () => {
  it('Calculates PNL correctly', () => {
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
    expect(pnl.decimalPlaces(20)).to.be.deep.equal(new BigNumber('0.27552238805970149253'))
  })
})
