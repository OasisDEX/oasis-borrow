import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import {
  debtScalingFactor$,
  DEFAULT_DEBT_SCALING_FACTOR,
  RANDOM_DEBT_SCALING_FACTOR,
} from 'helpers/mocks/ilks.mock'
import { defaultCollateral, defaultDebt, mockVaults } from 'helpers/mocks/vaults.mock'

describe('vaults$', () => {
  afterEach(() => {
    debtScalingFactor$.next(DEFAULT_DEBT_SCALING_FACTOR)
  })

  it('should produce some vault state', () => {
    const state = mockVaults()
    expect(state()).to.not.be.undefined
  })

  it.only('should account for accrued debt', () => {
    const hundredThousand = new BigNumber('100000')
    const fiftyMillion = new BigNumber('50000000')
    const state = mockVaults({
      collateral: hundredThousand,
      debt: fiftyMillion,
    })

    expect(state().lockedCollateral).to.deep.equal(hundredThousand)
    expect(state().debt).to.deep.equal(fiftyMillion)
    debtScalingFactor$.next(new BigNumber('1.0000005555555555'))
    expect(state().lockedCollateral).to.deep.equal(hundredThousand)
    expect(state().debt).to.deep.eq(new BigNumber('50000027.777777775'))
    expect(state().approximateDebt).to.deep.eq(new BigNumber('50000027.777777'))
  })
})
