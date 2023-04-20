import BigNumber from 'bignumber.js'
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

    expect(state().afterDebt).toEqual(zero)
    expect(state().afterMultiply).toEqual(one)
    expect(state().afterFreeCollateral).toEqual(zero)
    expect(state().daiYieldFromTotalCollateral).toEqual(zero)
    expect(state().afterNetValueUSD).toEqual(zero)
    expect(state().afterBuyingPower).toEqual(zero)
  })
})
