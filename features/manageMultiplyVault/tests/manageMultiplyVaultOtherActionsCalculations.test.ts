/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'

describe('Other actions calculations', () => {
  it('Should calculate parameters for closeTo correctly', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('50'),
          debt: new BigNumber('5000'),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('closeVault')

    expect(state().afterDebt).to.be.deep.equal(zero)
    expect(state().afterMultiply).to.be.deep.equal(one)
    expect(state().afterFreeCollateral).to.be.deep.equal(zero)
    expect(state().daiYieldFromTotalCollateral).to.be.deep.equal(zero)
    expect(state().afterNetValueUSD).to.be.deep.equal(zero)
    expect(state().afterBuyingPower).to.be.deep.equal(zero)
  })
})
