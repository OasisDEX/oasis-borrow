import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { BehaviorSubject, of } from 'rxjs'

import { mockVault$ } from '../helpers/mocks/vaults.mock'
import { getStateUnpacker } from '../helpers/testHelpers'
import { zero } from '../helpers/zero'

describe('instiVault$', () => {
  it('pipes nib, peace', () => {
    function createStream(
      startValue: number,
    ): [BehaviorSubject<BigNumber>, () => BehaviorSubject<BigNumber>] {
      const bs = new BehaviorSubject<BigNumber>(new BigNumber(startValue))
      return [bs, () => bs]
    }

    const [charterNib$, createCharterNib$] = createStream(1)
    const [charterPeace$, createCharterPeace$] = createStream(5)
    const [charterUline$, createCharterUline$] = createStream(10)

    const { instiVault$ } = mockVault$({
      _charterNib$: createCharterNib$(),
      _charterPeace$: createCharterPeace$(),
      _charterUline$: createCharterUline$(),
    })

    const state = getStateUnpacker(instiVault$)

    charterNib$.next(new BigNumber(2))
    charterPeace$.next(new BigNumber(6))
    charterUline$.next(new BigNumber(11))

    expect(state().originationFeePercent.toString()).to.eq('2')
    expect(state().activeCollRatio.toString()).to.eq('6')
  })

  it('takes the debt ceiling/available ilk debt from the charter contract', () => {
    const debt = new BigNumber(100000000)
    const collateral = new BigNumber(1e15) // big enough that we are limited by ilkDebtAvailable rather than collateral
    const chartedDebtCeiling = new BigNumber(900000000) // realistic number for debt ceiling

    const { instiVault$ } = mockVault$({
      collateral,
      _charterUline$: of(chartedDebtCeiling),
      _charterNib$: of(zero), // remove origination fee for this test,
      debt,
    })

    const state = getStateUnpacker(instiVault$)
    expect(state().daiYieldFromLockedCollateral.toString()).to.eq('800000000')
  })
})
