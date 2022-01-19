/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'

import { legacyToggle } from './legacyToggle'

describe('Other actions calculations', () => {
  it('Should calculate initial parameters for closeTo actions correctly', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('50'),
          debt: new BigNumber('5000'),
        },
      }),
    )

    legacyToggle(state())
    state().setOtherAction!('closeVault')

    expect(state().afterDebt).to.be.deep.equal(zero)
    expect(state().afterMultiply).to.be.deep.equal(one)
    expect(state().afterFreeCollateral).to.be.deep.equal(zero)
    expect(state().daiYieldFromTotalCollateral).to.be.deep.equal(zero)
    expect(state().afterNetValueUSD).to.be.deep.equal(zero)
    expect(state().afterBuyingPower).to.be.deep.equal(zero)
  })
})
