import { expect } from 'chai'
import { mockIlkDataList } from 'helpers/mocks/ilks.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { of } from 'rxjs'

import { createIlksPerToken$ } from './ilksPerToken'

describe('createIlksPerToken$', () => {
  it('should order correctly', () => {
    const state = getStateUnpacker(createIlksPerToken$(of(mockIlkDataList())))

    expect(state()).to.have.property('WBTC')
    expect(state()).to.have.property('USDC')
    expect(state()).to.have.property('ETH')
    expect(state()).to.have.property('LINK')
    expect(state()).to.have.property('UNI LP Tokens')
  })
})
