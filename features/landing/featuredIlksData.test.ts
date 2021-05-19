import { expect } from 'chai'
import { mockIlkDataList } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { createFeaturedIlks$ } from './featuredIlksData'

describe('createFeaturedIlks$', () => {
  it('should order correctly', () => {
    const state = getStateUnpacker(createFeaturedIlks$(of(mockIlkDataList())))
    expect(state()[0].ilk).to.eq('LINK-A')
    expect(state()[1].ilk).to.eq('ETH-A')
    expect(state()[2].ilk).to.eq('WBTC-A')
  })
})
