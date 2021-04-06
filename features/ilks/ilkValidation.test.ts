import { expect } from 'chai'
import { getStateUnpacker } from 'helpers/testHelpers'
import { EMPTY, of } from 'rxjs'

import { createIlkValidation$ } from './ilkValidation'

describe('ilkValidation', () => {
  it('should be in a loading state until ilks$ returns a value', () => {
    const state = getStateUnpacker(createIlkValidation$(EMPTY, ''))
    expect(state().status).to.be.equal('ilkValidationLoading')
  })

  it('should fail if ilk does not exist in ilks$', () => {
    const state = getStateUnpacker(createIlkValidation$(of(['ETH-A']), 'ETH-B'))
    expect(state().status).to.be.equal('ilkValidationFailure')
    expect(state().ilk).to.be.equal('ETH-B')
  })

  it('should succeed if ilk exists in ilks$', () => {
    const state = getStateUnpacker(createIlkValidation$(of(['ETH-A']), 'ETH-A'))
    expect(state().status).to.be.equal('ilkValidationSuccess')
    expect(state().ilk).to.be.equal('ETH-A')
  })
})
