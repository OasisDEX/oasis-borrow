/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import {
  calculateCloseToCollateralParams,
  calculateCloseToDaiParams,
  LOAN_FEE,
  OAZO_FEE,
  SLIPPAGE,
} from 'helpers/multiply/calculations'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'

describe('Other actions calculations', () => {
  it('Should calculate initial parameters for closeTo actions correctly', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('50'),
          debt: new BigNumber('5000'),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('closeVault')

    expect(state().afterDebt).to.be.deep.equal(zero)
    expect(state().afterMultiply).to.be.deep.equal(one)
    expect(state().afterFreeCollateral).to.be.deep.equal(zero)
    expect(state().daiYieldFromTotalCollateral).to.be.deep.equal(zero)
    expect(state().afterNetValueUSD).to.be.deep.equal(zero)
    expect(state().afterBuyingPower).to.be.deep.equal(zero)
  })

  it('Should calculate close to DAI params correctly', () => {
    const currentDebt = new BigNumber(10000)
    const currentCollateral = new BigNumber(20)
    const marketPrice = new BigNumber(1000)

    const expectedFromTokenAmount = currentCollateral
    const expectedToTokenAmount = new BigNumber(19960)
    const expectedMinToTokenAmount = new BigNumber(19860.2)

    const expectedLoanFee = new BigNumber(9)
    const expectedOazoFee = new BigNumber(40)

    const {
      loanFee,
      oazoFee,
      minToTokenAmount,
      toTokenAmount,
      fromTokenAmount,
    } = calculateCloseToDaiParams(
      marketPrice,
      OAZO_FEE,
      LOAN_FEE,
      currentCollateral,
      SLIPPAGE,
      currentDebt,
    )

    expect(fromTokenAmount).to.be.deep.equal(expectedFromTokenAmount)
    expect(toTokenAmount).to.be.deep.equal(expectedToTokenAmount)
    expect(minToTokenAmount).to.be.deep.equal(expectedMinToTokenAmount)

    expect(loanFee).to.be.deep.equal(expectedLoanFee)
    expect(oazoFee).to.be.deep.equal(expectedOazoFee)
  })

  it('Should calculate close to collateral params correctly', () => {
    const currentDebt = new BigNumber(10000)
    const marketPrice = new BigNumber(1000)

    const expectedFromTokenAmount = new BigNumber('10.07941507537688442211')
    const expectedToTokenAmount = new BigNumber('10079.16309')
    const expectedMinToTokenAmount = new BigNumber('10029.018')

    const expectedLoanFee = new BigNumber(9)
    const expectedOazoFee = new BigNumber(20.018)

    const {
      loanFee,
      oazoFee,
      minToTokenAmount,
      toTokenAmount,
      fromTokenAmount,
    } = calculateCloseToCollateralParams(marketPrice, OAZO_FEE, LOAN_FEE, currentDebt, SLIPPAGE)

    expect(fromTokenAmount).to.be.deep.equal(expectedFromTokenAmount)
    expect(toTokenAmount).to.be.deep.equal(expectedToTokenAmount)
    expect(minToTokenAmount).to.be.deep.equal(expectedMinToTokenAmount)

    expect(loanFee).to.be.deep.equal(expectedLoanFee)
    expect(oazoFee).to.be.deep.equal(expectedOazoFee)
  })
})
