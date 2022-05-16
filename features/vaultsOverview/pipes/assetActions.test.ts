import { expect } from 'chai'
import { createAssetActions$ } from './assetActions'
import { of } from 'rxjs'
import { getStateUnpacker } from '../../../helpers/testHelpers'

describe.only('asset actions', () => {
  it('shows borrow action only for borrow token', () => {
    const ilkToToken$ = (ilk: string) => of('ETH')
    const productCategoryIlks = {
      borrow: ['ETH-A'],
      multiply: [],
      earn: [],
    }
    const assetActions$ = createAssetActions$(ilkToToken$, productCategoryIlks, 'ETH')

    const state = getStateUnpacker(assetActions$)

    expect(state().length).eq(1)

    const borrowAction = state()[0]
    expect(borrowAction.text).eq('Borrow')
    expect(borrowAction.icon).eq('collateral')
    expect(borrowAction.url).eq('/borrow')
  })

  it('shows multiply action for multiply', () => {
    const ilkToToken$ = (ilk: string) => of('WBTC')
    const productCategoryIlks = {
      borrow: ['WBTC-A'],
      multiply: ['WBTC-A'],
      earn: [],
    }
    const assetActions$ = createAssetActions$(ilkToToken$, productCategoryIlks, 'WBTC')

    const state = getStateUnpacker(assetActions$)

    expect(state().length).eq(2)

    const borrowAction = state()[0]
    expect(borrowAction.text).eq('Borrow')
    expect(borrowAction.icon).eq('collateral')
    expect(borrowAction.url).eq('/borrow')

    const multiplyAction = state()[1]
    expect(multiplyAction.text).eq('Multiply')
    expect(multiplyAction.icon).eq('copy')
    expect(multiplyAction.url).eq('/multiply')
  })

  it('includes swaps')

  it('returns nothing/empty for something that has no actions')
})
