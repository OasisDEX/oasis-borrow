import { expect } from 'chai'
import {
  debtScalingFactor$,
  DEFAULT_DEBT_SCALING_FACTOR,
  defaultIlkDebt,
  mockIlkData,
  RANDOM_DEBT_SCALING_FACTOR,
} from 'helpers/mocks/ilks.mock'

describe('ilkData$', () => {
  afterEach(() => {
    debtScalingFactor$.next(DEFAULT_DEBT_SCALING_FACTOR)
  })
  it('should produce IlkData state', () => {
    const state = mockIlkData()

    expect(state()).to.not.be.undefined
  })

  it('should account for accrued debt', () => {
    const state = mockIlkData()

    expect(state().ilkDebt).to.deep.equal(defaultIlkDebt)
    const expectedIlkDebtAvailable = defaultIlkDebt.times(2.5).minus(defaultIlkDebt)
    expect(state().ilkDebtAvailable).to.deep.equal(expectedIlkDebtAvailable)

    debtScalingFactor$.next(RANDOM_DEBT_SCALING_FACTOR)
    expect(state().ilkDebt.gt(defaultIlkDebt)).to.be.true
    expect(state().ilkDebtAvailable.lt(expectedIlkDebtAvailable)).to.be.true
  })
})
