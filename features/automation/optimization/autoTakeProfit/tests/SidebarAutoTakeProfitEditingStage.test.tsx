/* eslint-disable @typescript-eslint/no-unused-vars */

import { AppContextProvider } from 'components/AppContextProvider'
import { render } from 'enzyme'
import { useAppContext } from 'features/automation/optimization/autoTakeProfit/test-helpers'
import { DummyComponent } from 'features/automation/optimization/autoTakeProfit/tests/DummyComponent'
import React from 'react'
// not sure which syntax is correct, keep getting  Cannot find module 'components/AppContextProvider' from 'features/automation/optimization/autoTakeProfit/tests/SidebarAutoTakeProfitEditingStage.test.tsx'
// same for jest.doMock
jest.mock('components/AppContextProvider', () => useAppContext())
// jest.mock<typeof import('components/AppContextProvider')>('components/AppContextProvider', () => useAppContext())

describe('given user has no trigger', () => {
  beforeEach(() => {
    // mockUiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
    //   type: 'form-defaults',
    //   executionPrice: initialSelectedPrice,
    //   executionCollRatio: initialSelectedColRatio,
    //   toCollateral: true,
    // })
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
    // TODO ŁW
    // tried mount, render from enzyme
    // idea is to try render from testing-library instead
    render(
      <AppContextProvider>
        <DummyComponent />
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
