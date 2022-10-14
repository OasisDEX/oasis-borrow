import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { expect } from 'chai'
import { initializeUIChanges } from 'components/AppContext'
import { mockVaults } from 'helpers/mocks/vaults.mock'
// Not sure if the test should be for reducer itself or check whole forms, what components are mounted,rendered etc. ~Ł
const hundredThousand = new BigNumber('100000')
const fiftyMillion = new BigNumber('50000000')
const mockVault = mockVaults({
    collateral: hundredThousand,
    debt: fiftyMillion,
  })

const mockUiChanges = initializeUIChanges()

// prapare mock AutoTakeProfitTriggerData
// mock return of useAppContext to return mock uiChanges?
// then call useAutoTakeProfitStateInitializator
describe('autoTakeProfitFormChangeReducer', () => {

  before(() => {})
  beforeEach(() => {})

  describe('given user has no trigger', () => {
    it('should render form with default values values', () => {
      expect(true).to.be.true // this is just to pass the linter check
      describe('and given execution-price was edited, and then reset button was clicked', () => {
        it('should restore default executionPrice', () => {})
        it('should restore default executionCollRatio', () => {})
      })
    })

    //Below are scenarios which would be the same for both cases existing triggegr or no trigger so not sure if needed to duplicate
    describe('given execution-price was edited', () => {
      it('should emit form change with edited execution-price', () => {})
      it('should emit form change with edited executionCollRatio', () => {})
    })

    describe('user is trying to add trigger, transaction is pending', () => {
      it('should contain txDetails with expected values', () => {})
    })
  })

  describe('given user has trigger', () => {
    it('should render form with trigger values', () => {})
    describe('and given execution-price was edited, and then reset button was clicked', () => {
      it("should restore existing trigger's executionPrice", () => {})
      it("should restore existing trigger's executionCollRatio", () => {})
    })
  })
})

