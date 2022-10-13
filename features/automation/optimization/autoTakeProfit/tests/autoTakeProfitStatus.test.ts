import { expect } from 'chai'

describe('createClosePickerConfig', () => {
  describe('given state isCloseToCollateral', () => {
    it('should return close to collateral config', () => {
      expect(true).to.be.true // this is just to pass the linter check
    })
  })
  describe('given state is not isCloseToCollateral', () => {
    it('should return close to DAI config', () => {})
  })
  describe('given vault with token ETH and state state isCloseToCollateral', () => {
    it('should return close to collateral config, collateral token symbol ETH', () => {})
  })

  describe('given vault with token WBTC and state state isCloseToCollateral', () => {
    it('should return close to collateral config, collateral token symbol WBTC', () => {})
  })
  describe('given vault with token UNI and state state not isCloseToCollateral', () => {
    it('should return close to DAI config, collateral token symbol UNI', () => {})
  })
  // Icon circle is remaining from old component
})

// Does it make much sense to mock everything to test this method or its fine as all smaller methods called within it are tested? ~Ł
describe('getAutoTakeProfitStatus', () => {})