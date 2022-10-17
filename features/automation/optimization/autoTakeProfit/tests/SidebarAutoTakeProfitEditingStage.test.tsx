import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { initializeUIChanges } from 'components/AppContext'
import { render } from 'enzyme'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { getAutoTakeProfitStatus } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitStatus'
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
const isOwner = true
const isProgressStage = false
const isRemoveForm = false
const stage = 'editing'
const tokenMarketPrice = new BigNumber(5000)
const ilkData = {
  debtCeiling: new BigNumber('8000630'),
  debtFloor: new BigNumber('250'),
  normalizedIlkDebt: new BigNumber('7775'),
  debtScalingFactor: new BigNumber('8000630'),
  maxDebtPerUnitCollateral: new BigNumber('8000630'),
}
describe('given user has no trigger', () => {
  // This scenario seems feature envy with tests for AutoTakeProfitFormControl ~Ł
  // eslint-disable-next-line no-only-tests/no-only-tests
  it.only('should render form with default values', () => {
    const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(
      AUTO_TAKE_PROFIT_FORM_CHANGE,
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      closePickerConfig,
      isEditing,
      isDisabled,
      min,
      max,
      resetData,
    } = getAutoTakeProfitStatus({
      autoTakeProfitState,
      autoTakeProfitTriggerData: mockAutoTakeProfitTriggerDataNoTrigger,
      isOwner,
      isProgressStage,
      isRemoveForm,
      stage,
      tokenMarketPrice,
      vault: mockVault(),
    })
    render(
      <SidebarAutoTakeProfitEditingStage
        autoTakeProfitState={autoTakeProfitState}
        autoTakeProfitTriggerData={mockAutoTakeProfitTriggerDataNoTrigger}
        closePickerConfig={closePickerConfig}
        ethMarketPrice={tokenMarketPrice}
        isEditing={isEditing}
        sliderConfig={sliderConfig}
        tokenMarketPrice={tokenMarketPrice}
        vault={mockVault()}
        ilkData={ilkData}
        errors={errors}
        warnings={warnings}
      />,
    )
    // here just assert that state contains correct default
    expect(autoTakeProfitState.currentForm).to.equal('add')
    expect(autoTakeProfitState.toCollateral).to.equal(defaultAutoTakeProfitData.isToCollateral)
    expect(autoTakeProfitState.executionPrice).to.equal(defaultAutoTakeProfitData.executionPrice)
    // expect(autoTakeProfitState.executionCollRatio).to.equal(defaultAutoTakeProfitData.)
    expect(autoTakeProfitState.isEditing).to.equal(false)
    expect(isAutoTakeProfitEnabled).to.equal(false)
  })
})
