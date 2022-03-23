import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { BehaviorSubject } from 'rxjs'

import { mockVault$ } from '../helpers/mocks/vaults.mock'
import { getStateUnpacker } from '../helpers/testHelpers'

describe('instiVault$', () => {
  it('pipes nib, peace, and uline', () => {
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
    expect(state().debtCeiling.toString()).to.eq('11')
  })

  it('takes the debt ceiling from the charter contract')
})
