import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { HOUR } from 'components/constants'
import {
  calcDebtScalingFactor,
  debtScalingFactor$,
  DEFAULT_DEBT_SCALING_FACTOR,
} from 'helpers/mocks/ilks.mock'
import { mockManageInstiVault$, mockManageVault } from 'helpers/mocks/manageVault.mock'
import { one } from 'helpers/zero'

import { mockVault$ } from '../../../../helpers/mocks/vaults.mock'
import { getStateUnpacker } from '../../../../helpers/testHelpers'

describe('manageVaultCalculations', () => {
  afterEach(() => {
    debtScalingFactor$.next(DEFAULT_DEBT_SCALING_FACTOR)
  })

  /*
   * This test validates that we are calculating an offset amount such that
   * when a drip (or even several) occurs immeditately after a user attempts
   * to withdrawMax but before the tx occurs, the amount we specify for maxAmount
   * takes into account the accrued debt.
   * The naiive approach is to use the current freeCollateral amount, which
   * is derived from the current debt value. If we select this amount and a drip
   * occurs, increasing the amount of debt in the vault and decreasing the amount
   * of collateral that is withdrawable.
   * The other naiive solution is to round the debt amount to x decimal places
   * down so that we are always selecting an amount less than the debt. This too
   * is problematic as rounding won't work on already rounded values. Also as
   * the debt compounds exponentially the larger the vault, a fixed decimal place
   * won't work either
   * Another solution which won't work is to select a fixed offset amount, calculated
   * from a fixed percentage of the debt in the vault. This too suffers from the
   * compounding issue with larger vaults.
   * The solution tested below is to create an offset that calculates the
   * expected compound interest over a period of time, e.g an hour, and to use
   * that as the offset value
   */
  it('should calculate maxWithdrawAmount as to never exceed real freeCollateral', () => {
    const state = mockManageVault({
      vault: {
        collateral: new BigNumber('31'),
        debt: new BigNumber('2000'),
      },
      priceInfo: {
        collateralPrice: new BigNumber('100'),
      },
    })
    function realFreeCollateral() {
      return state().vault.lockedCollateral.minus(
        state()
          .vault.debt.times(state().ilkData.liquidationRatio)
          .div(state().priceInfo.currentCollateralPrice),
      )
    }

    const currentMaxWithdrawAmount = state().maxWithdrawAmount

    expect(currentMaxWithdrawAmount.lt(one)).to.be.true
    expect(realFreeCollateral()).to.deep.eq(one)

    debtScalingFactor$.next(calcDebtScalingFactor(new BigNumber('1.045'), HOUR))
    expect(realFreeCollateral().lt(one)).to.be.true
    expect(realFreeCollateral().gt(currentMaxWithdrawAmount)).to.be.true
  })

  it('should calculate maxGenerateAmount and account for accrued debt in system', () => {
    const collateral = new BigNumber('150')
    const debt = new BigNumber('5000')
    const price = new BigNumber('100')
    const state = mockManageVault({
      vault: {
        collateral,
        debt,
      },
      priceInfo: {
        collateralPrice: price,
      },
    })

    expect(state().daiYieldFromTotalCollateral).to.deep.eq(new BigNumber('5000'))
    const selectedMaxGenerateAmount = state().maxGenerateAmount
    const originalDebtOffset = state().vault.debtOffset
    expect(selectedMaxGenerateAmount.lt(state().daiYieldFromTotalCollateral)).to.be.true
    expect(state().daiYieldFromTotalCollateral.minus(selectedMaxGenerateAmount)).to.deep.eq(
      originalDebtOffset,
    )

    debtScalingFactor$.next(calcDebtScalingFactor(new BigNumber('1.045'), HOUR))

    expect(state().daiYieldFromTotalCollateral.lt(new BigNumber('5000'))).to.be.true
    expect(state().daiYieldFromTotalCollateral.gt(selectedMaxGenerateAmount)).to.be.true
    expect(state().maxGenerateAmount.lt(selectedMaxGenerateAmount)).to.be.true
    expect(state().daiYieldFromTotalCollateral.minus(state().maxGenerateAmount)).to.deep.eq(
      state().vault.debtOffset,
    )
    expect(state().vault.debtOffset.gt(originalDebtOffset)).to.be.true
  })

  it(
    'should calculate daiYieldFromTotalCollateral and daiYieldFromTotalCollateralAtNextPrice ' +
      'from origination fee and min active col ratio',
    () => {
      const state = getStateUnpacker(
        mockManageInstiVault$({
          _instiVault$: mockVault$({
            collateral: new BigNumber('151.5'),
            debt: new BigNumber('99.99'),
            minActiveColRatio: new BigNumber('1.5'),
            originationFee: new BigNumber('0.01'),
            priceInfo: {
              currentCollateralPrice: new BigNumber('1'),
              nextCollateralPrice: new BigNumber('2'),
            },
          }).instiVault$,
          priceInfo: {
            collateralPrice: new BigNumber('1'),
            collateralChangePercentage: new BigNumber('1'),
          },
        }),
      )

      expect(state().daiYieldFromTotalCollateral?.toString()).eq('1')
      expect(state().daiYieldFromTotalCollateralAtNextPrice?.toString()).eq('101')
    },
  )
})
