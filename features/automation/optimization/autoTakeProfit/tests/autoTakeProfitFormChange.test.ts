import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { initializeUIChanges } from 'components/AppContext'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { defaultAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useAutoTakeProfitStateInitializator } from 'features/automation/optimization/autoTakeProfit/state/useAutoTakeProfitStateInitializator'
import { mockVaults } from 'helpers/mocks/vaults.mock'
import { useUIChanges } from 'helpers/uiChangesHook'
// Not sure if the test should be for reducer itself or check whole forms, what components are mounted,rendered etc. ~Ł
const hundredThousand = new BigNumber('100000')
const fiftyMillion = new BigNumber('50000000')
const mockVault = mockVaults({
  collateral: hundredThousand,
  debt: fiftyMillion,
})

const mockUiChanges = initializeUIChanges()
const mockAutoTakeProfitTriggerDataNoTrigger = defaultAutoTakeProfitData
const isAutoTakeProfitEnabled = useAutoTakeProfitStateInitializator(
  mockVault(),
  mockAutoTakeProfitTriggerDataNoTrigger,
  mockUiChanges,
)
// prapare mock AutoTakeProfitTriggerData
// mock return of useAppContext to return mock uiChanges?
// then call useAutoTakeProfitStateInitializator
describe('autoTakeProfitFormChangeReducer', () => {
  before(() => {})
  beforeEach(() => {})

  describe('given user has no trigger', () => {
    // This scenario seems feature envy with tests for AutoTakeProfitFormControl ~Ł
    // eslint-disable-next-line no-only-tests/no-only-tests
    it.only('should prepare default form values', () => {
      const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(
        AUTO_TAKE_PROFIT_FORM_CHANGE,
      )

      // here just assert that state contains correct default
      expect(autoTakeProfitState.currentForm).to.equal('add')
      expect(autoTakeProfitState.toCollateral).to.equal(defaultAutoTakeProfitData.isToCollateral)
      expect(autoTakeProfitState.executionPrice).to.equal(defaultAutoTakeProfitData.executionPrice)
      // expect(autoTakeProfitState.executionCollRatio).to.equal(defaultAutoTakeProfitData.)
      expect(autoTakeProfitState.isEditing).to.equal(false)
      expect(isAutoTakeProfitEnabled).to.equal(false)
      describe('and given execution-price was edited, and then reset button was clicked', () => {
        // here just call function that modifies state, check if it was modified, then call function used to reset, see if it worked
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
