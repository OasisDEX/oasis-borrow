/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
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

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

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
      OF: MULTIPLY_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })

  it('Decrease multiply', () => {
    const debt = new BigNumber(2000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)

    const requiredCollRatio = new BigNumber(5)

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

    const currentCollRatio = lockedCollateral.times(oraclePrice).div(debt)

    const { debtDelta, collateralDelta, loanFee, oazoFee } = getVaultChange({
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
      OF: MULTIPLY_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta))

    console.log(`
      currentCollRatio ${currentCollRatio}
      afterCollateralizationRatio: ${afterCollateralizationRatio}
      requiredCollRatio: ${requiredCollRatio}
      debtDelta ${debtDelta}
      collateralDelta ${collateralDelta}
      flashLoanFee: ${loanFee}
      oazoFee: ${oazoFee}
      `)

    // expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })

  it.skip('Calculate vault changes with required collaterization ratio change and collateral deposit', () => {
    // to investigate
    const debt = new BigNumber(1000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const depositAmount = new BigNumber(1)
    const slippage = new BigNumber(0.05)

    const requiredCollRatio = new BigNumber(2)

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

    const { debtDelta, collateralDelta, loanFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: MULTIPLY_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    console.log(`
      
      afterCollateralizationRatio: ${afterCollateralizationRatio}
      
      `)

    // expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })
})
