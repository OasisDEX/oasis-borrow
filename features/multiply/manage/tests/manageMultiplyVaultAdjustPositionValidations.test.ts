import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'

import { mockedStopLossTrigger } from '../../../../helpers/mocks/stopLoss.mock'
import { legacyToggle } from './legacyToggle'

describe('manageVaultAdjustPositionValidations', () => {
  before(() => {
    // TODO: remove after mainnet deployment
    window.location.search = ['?network=goerli'] as any
  })

  after(() => {
    window.location.search = [] as any
  })

  // TO DO, calculations are off at current price
  it('validates if required collateralization ratio is putting vault at risk, danger or exceeding day yield', () => {
    const requiredCollRatioYield = new BigNumber('1.49')
    const requiredCollRatioDanger = new BigNumber('1.75')
    const requiredCollRatioWarning = new BigNumber('2.25')

    const state = getStateUnpacker(mockManageMultiplyVault$())

    state().updateRequiredCollRatio!(requiredCollRatioYield)
    expect(state().errorMessages).to.deep.eq(['generateAmountExceedsDaiYieldFromTotalCollateral'])

    state().updateRequiredCollRatio!(requiredCollRatioDanger)
    expect(state().warningMessages).to.deep.eq([
      'vaultWillBeAtRiskLevelDanger',
      'vaultWillBeAtRiskLevelWarningAtNextPrice',
    ])

    state().updateRequiredCollRatio!(requiredCollRatioWarning)
    expect(state().warningMessages).to.deep.eq(['vaultWillBeAtRiskLevelWarning'])
  })

  it('validates if required collateralization ratio is putting vault at risk, danger or exceeds dai yield from total collateral at next price', () => {
    const requiredCollRatioYieldNextPrice = new BigNumber('1.6')
    const requiredCollRatioDangerNextPrice = new BigNumber('1.85')
    const requiredCollRatioWarningNextPrice = new BigNumber('2.3')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('25'),
        },
        priceInfo: {
          collateralChangePercentage: new BigNumber('-0.1'),
        },
      }),
    )

    state().updateRequiredCollRatio!(requiredCollRatioYieldNextPrice)
    expect(state().errorMessages).to.deep.eq([
      'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
    ])

    state().updateRequiredCollRatio!(requiredCollRatioDangerNextPrice)
    expect(state().warningMessages).to.deep.eq([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])

    state().updateRequiredCollRatio!(requiredCollRatioWarningNextPrice)
    expect(state().warningMessages).to.deep.eq(['vaultWillBeAtRiskLevelWarningAtNextPrice'], '3')
  })

  it(`validates if adjust action doesn't exceeds debt ceiling, debt floor`, () => {
    const requiredCollRatioExceeds = new BigNumber('1.75')
    const requiredCollRatioBelow = new BigNumber('150')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtCeiling: new BigNumber('8000500'),
          debtFloor: new BigNumber('2000'),
        },
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('500'),
          ilk: 'ETH-A',
        },
      }),
    )

    state().updateRequiredCollRatio!(requiredCollRatioExceeds)
    expect(state().errorMessages).to.deep.eq(['generateAmountExceedsDebtCeiling'])

    state().updateRequiredCollRatio!(requiredCollRatioBelow)
    expect(state().errorMessages).to.deep.eq(['debtWillBeLessThanDebtFloor'])
  })

  it('validates if vault has no collateral and can`t progress on adjust position', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: zero,
        },
      }),
    )

    expect(state().errorMessages).to.deep.eq([])
    legacyToggle(state())
    expect(state().errorMessages).to.deep.eq(['hasToDepositCollateralOnEmptyVault'])
    expect(state().canProgress).to.deep.eq(false)
  })

  it('validates if next coll ratio is below stop loss level', () => {
    localStorage.setItem('features', '{"Automation":true}')
    const requiredCollRatioBelowStopLoss = new BigNumber(2)
    const state = getStateUnpacker(
      mockManageMultiplyVault$({ _automationTriggersData$: of(mockedStopLossTrigger) }),
    )

    state().updateRequiredCollRatio!(requiredCollRatioBelowStopLoss)

    expect(state().errorMessages).to.deep.eq(['afterCollRatioBelowStopLossRatio'])
    expect(state().canProgress).to.deep.eq(false)
  })
})
