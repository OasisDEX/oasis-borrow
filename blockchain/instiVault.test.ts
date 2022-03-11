import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { BehaviorSubject, Observable, of } from 'rxjs'

import { mockVault$ } from '../helpers/mocks/vaults.mock'
import { getStateUnpacker } from '../helpers/testHelpers'
import { createInstiVault$ } from './instiVault'

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

    const instiVault$ = createInstiVault$(
      () => mockVault$(),
      createCharterNib$,
      createCharterPeace$,
      createCharterUline$,
      new BigNumber(1),
    )

    const state = getStateUnpacker(instiVault$)

    charterNib$.next(new BigNumber(2))
    charterPeace$.next(new BigNumber(6))
    charterUline$.next(new BigNumber(11))

    expect(state().originationFeePercent.toString()).to.eq('2')
    expect(state().activeCollRatio.toString()).to.eq('6')
    expect(state().debtCeiling.toString()).to.eq('11')
  })

  it('constructs nib, peace, uline with vault ilk and controller', () => {
    type CharterPipeArgs =
      | {
          ilk: string
          usr: string | undefined
        }
      | undefined

    const uncalledCharterPipeArgs: CharterPipeArgs = {
      ilk: 'no',
      usr: 'no',
    }

    let createCharterNib$FakeCalledWith: CharterPipeArgs = uncalledCharterPipeArgs
    function createCharterNib$Fake(args: CharterPipeArgs): Observable<BigNumber> {
      createCharterNib$FakeCalledWith = args
      return of(new BigNumber(1))
    }

    let createCharterPeace$FakeCalledWith: CharterPipeArgs = uncalledCharterPipeArgs
    function createCharterPeace$Fake(args: CharterPipeArgs): Observable<BigNumber> {
      createCharterPeace$FakeCalledWith = args
      return of(new BigNumber(2))
    }

    let createCharterUline$FakeCalledWith: CharterPipeArgs = uncalledCharterPipeArgs
    function createCharterUline$Fake(args: CharterPipeArgs): Observable<BigNumber> {
      createCharterUline$FakeCalledWith = args
      return of(new BigNumber(3))
    }

    const instiVault$ = createInstiVault$(
      () => mockVault$(),
      createCharterNib$Fake,
      createCharterPeace$Fake,
      createCharterUline$Fake,
      new BigNumber(1),
    )
    const instiVault = getStateUnpacker(instiVault$)()

    expect(createCharterNib$FakeCalledWith.ilk).to.eq(instiVault.ilk)
    expect(createCharterNib$FakeCalledWith.usr).to.eq(instiVault.controller)

    expect(createCharterPeace$FakeCalledWith.ilk).to.eq(instiVault.ilk)
    expect(createCharterPeace$FakeCalledWith.usr).to.eq(instiVault.controller)

    expect(createCharterUline$FakeCalledWith.ilk).to.eq(instiVault.ilk)
    expect(createCharterUline$FakeCalledWith.usr).to.eq(instiVault.controller)
  })
})
