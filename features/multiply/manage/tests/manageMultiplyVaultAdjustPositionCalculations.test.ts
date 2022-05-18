/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

import { roundRatioToBeDivisibleByFive } from '../../../../helpers/roundRatioToBeDivisibleByFive'
import { getVaultChange } from '../pipes/manageMultiplyVaultCalculations'

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

  it('Increase multiply deposit collateral', () => {
    const debt = new BigNumber(1000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)
    const depositAmount = new BigNumber(1)

    const requiredCollRatio = new BigNumber(2)

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
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta.plus(depositAmount))
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    expect(
      roundRatioToBeDivisibleByFive(afterCollateralizationRatio, BigNumber.ROUND_DOWN),
    ).to.deep.eq(requiredCollRatio)
  })

  it('Increase multiply deposit dai', () => {
    const debt = new BigNumber(1000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)
    const depositDaiAmount = new BigNumber(1000)

    const requiredCollRatio = new BigNumber(2)

    const { debtDelta, collateralDelta, loanFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount: depositDaiAmount.div(marketPrice),
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .plus(depositDaiAmount.div(marketPrice))
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    expect(
      roundRatioToBeDivisibleByFive(afterCollateralizationRatio, BigNumber.ROUND_UP),
    ).to.deep.eq(requiredCollRatio)
  })

  it('Decrease multiply', () => {
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

    expect(
      roundRatioToBeDivisibleByFive(afterCollateralizationRatio, BigNumber.ROUND_UP),
    ).to.deep.eq(requiredCollRatio)
  })

  it('Decrease multiply withdraw collateral', () => {
    const debt = new BigNumber(5000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)
    const withdrawAmount = new BigNumber(1)

    const requiredCollRatio = new BigNumber(3)

    const { debtDelta, collateralDelta } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount,
      generateAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta.minus(withdrawAmount))
      .times(oraclePrice)
      .div(debt.plus(debtDelta))

    expect(
      roundRatioToBeDivisibleByFive(afterCollateralizationRatio, BigNumber.ROUND_DOWN),
    ).to.deep.eq(requiredCollRatio)
  })

  it('Decrease multiply withdraw dai', () => {
    const debt = new BigNumber(5000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)
    const generateAmount = new BigNumber(1)

    const requiredCollRatio = new BigNumber(3)

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
      generateAmount,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(generateAmount))

    expect(
      roundRatioToBeDivisibleByFive(afterCollateralizationRatio, BigNumber.ROUND_DOWN),
    ).to.deep.eq(requiredCollRatio)
  })

  it('Calculates net value USD, after net value USD, after collateral delta USD using market price', () => {
    const expectedNetValueUSD = new BigNumber('2500')

    const afterCollRatio = new BigNumber('2')
    const expectedAfterCollateralDelta = new BigNumber('4.59317941753432925909')
    const expectedAfterCollateralDeltaUSD = new BigNumber('4593.17941753432925909159')
    const expectedAfterNetValueUSD = new BigNumber('2467.78331069865700920477')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('500'),
          ilk: 'ETH-A',
        },
        exchangeQuote: {
          marketPrice: new BigNumber('1000'),
        },
      }),
    )

    // expect to have different market price and oracle price for this test
    expect(state().priceInfo.currentCollateralPrice.decimalPlaces(20)).to.not.deep.equal(
      state().marketPrice,
    )
    expect(state().collateralDelta).to.deep.equal(zero)
    expect(state().collateralDeltaUSD).to.deep.equal(zero)
    expect(state().netValueUSD.decimalPlaces(20)).to.deep.equal(expectedNetValueUSD)

    state().updateRequiredCollRatio!(afterCollRatio)
    expect(state().collateralDelta!.decimalPlaces(20)).to.deep.equal(expectedAfterCollateralDelta)
    expect(state().collateralDeltaUSD!.decimalPlaces(20)).to.deep.equal(
      expectedAfterCollateralDeltaUSD,
    )
    expect(state().afterNetValueUSD.decimalPlaces(20)).to.deep.equal(expectedAfterNetValueUSD)
  })
})
