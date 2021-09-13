import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'

describe('manageVaultAdjustPositionValidations', () => {
  // TO DO, calculations are off at current price
  it.skip('validates if required collateralization ratio is putting vault at risk, danger or exceeding day yield', () => {
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
    const requiredCollRatioYieldNextPrice = new BigNumber('1.75')
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
    expect(state().warningMessages).to.deep.eq(['vaultWillBeAtRiskLevelWarningAtNextPrice'])
  })

  it(`validates if generate doesn't exceeds debt ceiling, debt floor`, () => {
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
    expect(state().errorMessages).to.deep.eq(['generateAmountLessThanDebtFloor'])
  })
})
