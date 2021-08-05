/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { zero } from 'helpers/zero'
import { SLIPPAGE } from '../manageMultiplyQuote'

import { getVaultChange } from '../manageMultiplyVaultCalculations'

describe('Adjust multiply calculations', () => {
  it.only('Increase multiply', () => {
    const debt = new BigNumber(1000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)

    const requiredCollRatio = new BigNumber(2)

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

    const { debtDelta, collateralDelta, flashLoanFee, oazoFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage: SLIPPAGE,
      depositCollateralAmount: zero,
      depositDaiAmount: zero,
      withdrawCollateralAmount: zero,
      withdrawDaiAmount: zero,
      OF: MULTIPLY_FEE,
      LF: LOAN_FEE,
    })

    console.log(`
    flashLoanFee ${flashLoanFee}
    oazoFee ${oazoFee}
    `)

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(flashLoanFee))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })

  it('Decrease multiply', () => {
    const debt = new BigNumber(2000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)

    const requiredCollRatio = new BigNumber(4)

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

    const currentCollRatio = lockedCollateral.times(oraclePrice).div(debt)

    const { debtDelta, collateralDelta, flashLoanFee, oazoFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage: SLIPPAGE,
      depositCollateralAmount: zero,
      depositDaiAmount: zero,
      withdrawCollateralAmount: zero,
      withdrawDaiAmount: zero,
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
      flashLoanFee: ${flashLoanFee}
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
    const depositCollateralAmount = new BigNumber(1)

    const requiredCollRatio = new BigNumber(2)

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

    const { debtDelta, collateralDelta, flashLoanFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage: SLIPPAGE,
      depositCollateralAmount,
      depositDaiAmount: zero,
      withdrawCollateralAmount: zero,
      withdrawDaiAmount: zero,
      OF: MULTIPLY_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(flashLoanFee))

    console.log(`
      
      afterCollateralizationRatio: ${afterCollateralizationRatio}
      
      `)

    // expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })
})
