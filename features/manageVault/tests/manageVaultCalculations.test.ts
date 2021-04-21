import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { HOUR } from 'components/constants'
import {
  calcDebtScalingFactor,
  debtScalingFactor$,
  DEFAULT_DEBT_SCALING_FACTOR,
} from 'helpers/mocks/ilks.mock'
import { mockManageVault } from 'helpers/mocks/manageVault.mock'
import { one } from 'helpers/zero'

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
})
