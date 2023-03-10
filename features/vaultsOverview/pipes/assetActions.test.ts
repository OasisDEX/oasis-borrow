import { AssertionError } from 'assert'
import { expect } from 'chai'
import { of } from 'rxjs'

import { UIChanges } from '../../../components/AppContext'
import { mockContextConnected } from '../../../helpers/mocks/context.mock'
import { getStateUnpacker } from '../../../helpers/testHelpers'
import { createAssetActions$, isOnClickAction, isUrlAction } from './assetActions'

function assertAssetAction(
  assetActionIsCorrectType: any,
  message: string,
): asserts assetActionIsCorrectType {
  if (!assetActionIsCorrectType) {
    throw new AssertionError({ message })
  }
}

describe('asset actions', () => {
  const stubUIChanges: UIChanges = {
    publish: () => {
      throw new Error('unimplemented')
    },
    subscribe: () => {
      throw new Error('unimplemented')
    },
    lastPayload: () => {
      throw new Error('unimplemented')
    },
    clear: () => {
      throw new Error('unimplemented')
    },
    configureSubject: () => {
      throw new Error('unimplemented')
    },
  }
  it('shows borrow action for borrow token', () => {
    function ilkToToken$() {
      return of('ETH')
    }

    const productCategoryIlks = {
      borrow: ['ETH-A'],
      multiply: [],
      earn: [],
    }
    const assetActions$ = createAssetActions$(
      of(mockContextConnected),
      ilkToToken$,
      productCategoryIlks,
      stubUIChanges,
      'ETH',
    )

    const state = getStateUnpacker(assetActions$)

    expect(state().length).eq(2)

    const borrowAction = state()[1]
    assertAssetAction(isUrlAction(borrowAction), 'borrow action is not url asset action')
    expect(borrowAction.text).eq('Borrow')
    expect(borrowAction.icon).eq('collateral')
    expect(borrowAction.path).eq('/borrow')
  })

  it('shows moth borrow and multiply action', () => {
    function ilkToToken$() {
      return of('WBTC')
    }

    const productCategoryIlks = {
      borrow: ['WBTC-A'],
      multiply: ['WBTC-A'],
      earn: [],
    }
    const assetActions$ = createAssetActions$(
      of(mockContextConnected),
      ilkToToken$,
      productCategoryIlks,
      stubUIChanges,
      'WBTC',
    )

    const state = getStateUnpacker(assetActions$)

    expect(state().length).eq(3)

    const borrowAction = state()[1]
    assertAssetAction(isUrlAction(borrowAction), 'borrow action is not url asset action')
    expect(borrowAction.text).eq('Borrow')
    expect(borrowAction.icon).eq('collateral')
    expect(borrowAction.path).eq('/borrow')

    const multiplyAction = state()[2]
    assertAssetAction(isUrlAction(multiplyAction), 'borrow action is not url asset action')
    expect(multiplyAction.text).eq('Multiply')
    expect(multiplyAction.icon).eq('copy')
    expect(multiplyAction.path).eq('/multiply')
  })

  it('includes swaps', () => {
    function ilkToToken$() {
      return of('WBTC')
    }

    const productCategoryIlks = {
      borrow: ['WBTC-A'],
      multiply: ['WBTC-A'],
      earn: [],
    }
    const assetActions$ = createAssetActions$(
      of(mockContextConnected),
      ilkToToken$,
      productCategoryIlks,
      stubUIChanges,
      'WBTC',
    )

    const state = getStateUnpacker(assetActions$)
    const swapAction = state()[0]
    assertAssetAction(isOnClickAction(swapAction), 'swap action is not onclick asset action')
    expect(swapAction.text).eq('Swap')
    expect(swapAction.icon).eq('exchange')
    expect(swapAction.onClick).to.not.be.undefined
  })
})
