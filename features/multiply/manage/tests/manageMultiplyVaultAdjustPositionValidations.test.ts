import BigNumber from 'bignumber.js'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { mockedStopLossTrigger } from 'helpers/mocks/stopLoss.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'

import { legacyToggle } from './legacyToggle'

// TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
describe.skip('manageVaultAdjustPositionValidations', () => {
  beforeAll(() => {
    // TODO: remove after mainnet deployment
    window.location.search = ['?network=goerli'] as any
  })

  afterAll(() => {
    window.location.search = [] as any
  })

  // TO DO, calculations are off at current price
  it('validates if required collateralization ratio is putting vault at risk, danger or exceeding day yield', () => {
    const requiredCollRatioYield = new BigNumber('1.49')
    const requiredCollRatioDanger = new BigNumber('1.75')
    const requiredCollRatioWarning = new BigNumber('2.25')

    const state = getStateUnpacker(mockManageMultiplyVault$())

    state().updateRequiredCollRatio!(requiredCollRatioYield)
    expect(state().errorMessages).toEqual(['generateAmountExceedsDaiYieldFromTotalCollateral'])

    state().updateRequiredCollRatio!(requiredCollRatioDanger)
    expect(state().warningMessages).toEqual([
      'vaultWillBeAtRiskLevelDanger',
      'vaultWillBeAtRiskLevelWarningAtNextPrice',
    ])

    state().updateRequiredCollRatio!(requiredCollRatioWarning)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarning'])
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
    expect(state().errorMessages).toEqual([
      'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
    ])

    state().updateRequiredCollRatio!(requiredCollRatioDangerNextPrice)
    expect(state().warningMessages).toEqual([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])

    state().updateRequiredCollRatio!(requiredCollRatioWarningNextPrice)
    expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarningAtNextPrice'])
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
    expect(state().errorMessages).toEqual(['generateAmountExceedsDebtCeiling'])

    state().updateRequiredCollRatio!(requiredCollRatioBelow)
    expect(state().errorMessages).toEqual(['debtWillBeLessThanDebtFloor'])
  })

  it('validates if vault has no collateral and can`t progress on adjust position', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: zero,
        },
      }),
    )

    expect(state().errorMessages).toEqual([])
    legacyToggle(state())
    expect(state().errorMessages).toEqual(['hasToDepositCollateralOnEmptyVault'])
    expect(state().canProgress).toEqual(false)
  })

  it('validates if next coll ratio is below stop loss level', () => {
    localStorage.setItem('features', '{"Automation":true}')
    const requiredCollRatioBelowStopLoss = new BigNumber(2)
    const state = getStateUnpacker(
      mockManageMultiplyVault$({ _automationTriggersData$: of(mockedStopLossTrigger) }),
    )

    state().updateRequiredCollRatio!(requiredCollRatioBelowStopLoss)

    expect(state().errorMessages).toEqual(['afterCollRatioBelowStopLossRatio'])
    expect(state().canProgress).toEqual(false)
  })
})
