/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from 'bignumber.js'
import { initializeUIChanges } from 'components/AppContext'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { render } from 'enzyme'
import { SidebarAutoTakeProfitEditingStage } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarAutoTakeProfitEditingStage'
import { createSliderConfig } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { getAutoTakeProfitStatus } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitStatus'
import { defaultAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { AppContextProvider } from 'features/automation/optimization/autoTakeProfit/test-helpers'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { mockVaults } from 'helpers/mocks/vaults.mock'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
// Not sure if the test should be for reducer itself or check whole forms, what components are mounted,rendered etc. ~Ł
const hundredThousand = new BigNumber('100000')
const fiftyMillion = new BigNumber('50000000')
const mockVault = mockVaults({
  collateral: hundredThousand,
  debt: fiftyMillion,
})
//
const mockUiChanges = initializeUIChanges()
// use this publish to set initial state
// const mockUiChanges = initializeUIChanges().publish()
const mockAutoTakeProfitTriggerDataNoTrigger = defaultAutoTakeProfitData
// initializer shouldn't be required with testAppContext
// const isAutoTakeProfitEnabled = useAutoTakeProfitStateInitializator(
//   mockVault(),
//   mockAutoTakeProfitTriggerDataNoTrigger,
//   mockUiChanges,
// )
const isOwner = true
const isProgressStage = false
const isRemoveForm = false
const stage = 'editing'
const tokenMarketPrice = new BigNumber(5000)
const mockEthCIlkData = mockIlkData({
  token: 'ETH',
  ilk: 'ETH-C',
  stabilityFee: new BigNumber('0.045'),
  liquidationRatio: new BigNumber('1.4'),
  ilkDebtAvailable: new BigNumber('100'),
})()
const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)
const vault = mockVault()
const { closePickerConfig, isEditing, isDisabled, min, max, resetData } = getAutoTakeProfitStatus({
  autoTakeProfitState,
  autoTakeProfitTriggerData: mockAutoTakeProfitTriggerDataNoTrigger,
  isOwner,
  isProgressStage,
  isRemoveForm,
  stage,
  tokenMarketPrice,
  vault: vault,
})
const initialSelectedPrice = new BigNumber(4000)

const initialSelectedColRatio = new BigNumber(500)
// TODO ŁW this could be extracted to be more reusable
const autoTakeSliderBasicConfig = {
  disabled: false,
  leftBoundryFormatter: (x: BigNumber) =>
    x.isZero() ? '-' : `$${formatAmount(x, 'USD')} ${vault.token}`,
  rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
  step: 1,
}
const sliderPercentageFill = getSliderPercentageFill({
  value: autoTakeProfitState.executionPrice,
  min: min,
  max,
})
const { t } = useTranslation()
const sliderConfig: SliderValuePickerProps = createSliderConfig(
  autoTakeSliderBasicConfig,
  sliderPercentageFill,
  t,
  vault,
  autoTakeProfitState,
  max,
  min,
  mockUiChanges,
  initialSelectedColRatio,
)
describe('given user has no trigger', () => {
  beforeEach(() => {
    mockUiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'form-defaults',
      executionPrice: initialSelectedPrice,
      executionCollRatio: initialSelectedColRatio,
      toCollateral: true,
    })
  })
  // This scenario seems feature envy with tests for AutoTakeProfitFormControl ~Ł
  // eslint-disable-next-line no-only-tests/no-only-tests
  it.only('should render form with default values', () => {
    // CANT DO IT THIS WAY NEED TO CREATE PROVIDER
    // could do wrapper over sidebar
    // const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(
    //   AUTO_TAKE_PROFIT_FORM_CHANGE,
    // )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    render(
      <AppContextProvider>
        <SidebarAutoTakeProfitEditingStage
          autoTakeProfitState={autoTakeProfitState}
          autoTakeProfitTriggerData={mockAutoTakeProfitTriggerDataNoTrigger}
          closePickerConfig={closePickerConfig}
          ethMarketPrice={tokenMarketPrice}
          isEditing={isEditing}
          sliderConfig={sliderConfig}
          tokenMarketPrice={tokenMarketPrice}
          vault={mockVault()}
          ilkData={mockEthCIlkData}
          errors={[]}
          warnings={[]}
        />
      </AppContextProvider>,
    )
    // here just assert that state contains correct default
    // expect(autoTakeProfitState.currentForm).to.equal('add')
    // expect(autoTakeProfitState.toCollateral).to.equal(defaultAutoTakeProfitData.isToCollateral)
    // expect(autoTakeProfitState.executionPrice).to.equal(defaultAutoTakeProfitData.executionPrice)
    // // expect(autoTakeProfitState.executionCollRatio).to.equal(defaultAutoTakeProfitData.)
    // expect(autoTakeProfitState.isEditing).to.equal(false)
    // expect(isAutoTakeProfitEnabled).to.equal(false)
  })
})
