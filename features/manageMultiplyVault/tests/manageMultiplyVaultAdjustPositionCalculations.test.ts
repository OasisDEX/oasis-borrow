/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'

import { getVaultChange } from '../manageMultiplyVaultCalculations'

describe('Adjust multiply calculations', () => {
  it('Increase multiply', () => {
    const debt = new BigNumber(1000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)

    const requiredCollRatio = new BigNumber(2)

    const { debtDelta, collateralDelta, loanFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })

  it.skip('Decrease multiply', () => {
    const debt = new BigNumber(2000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)

    const requiredCollRatio = new BigNumber(5)

    const { debtDelta, collateralDelta } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })
})
