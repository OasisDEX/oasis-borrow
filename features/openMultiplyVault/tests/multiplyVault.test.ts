/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockOpenMultiplyVault } from 'helpers/mocks/openMultiplyVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'

describe('open multiply vault', () => {
  // https://docs.google.com/spreadsheets/d/11fihiG_2DHiwtfHKXznLQXewP30ckB0umyqgY6Qqyf0/edit#gid=101951580
  it('should calculate vault state according spread sheet', () => {
    const multiplyVault$ = mockOpenMultiplyVault({
      priceInfo: {
        collateralPrice: new BigNumber(2000),
      },
      exchangeQuote: {
        marketPrice: new BigNumber(2100),
      },
      ilkData: {
        debtFloor: new BigNumber(5000),
        liquidationRatio: new BigNumber(1.5),
      },
    })
    const state = getStateUnpacker(multiplyVault$)

    state().updateDeposit!(new BigNumber(10))

    state().updateRequiredCollRatio!(new BigNumber(2))

    const stateSnap = state()

    expect(stateSnap.afterCollateralizationRatio.toPrecision(18)).to.eq('2.00000000000000000')
    expect(stateSnap.buyingCollateral.toPrecision(18)).to.eq('8.13486120817479598')
    expect(stateSnap.afterOutstandingDebt.toPrecision(18)).to.eq('18118.5545091165910')
  })

  it('should not allow to update risk when deposited not enough collateral', () => {
    const multiplyVault$ = mockOpenMultiplyVault({
      priceInfo: {
        collateralPrice: new BigNumber(2000),
      },
      exchangeQuote: {
        marketPrice: new BigNumber(2100),
      },
      ilkData: {
        debtFloor: new BigNumber(5000),
        liquidationRatio: new BigNumber(1.5),
      },
    })
    const state = getStateUnpacker(multiplyVault$)

    state().updateDeposit!(new BigNumber(1))

    const stateSnap = state()

    expect(stateSnap.canAdjustRisk).to.eq(false)
  })

  it('should allow to set maximum 500% collaterization ratio when depositing enough collateral', () => {
    const multiplyVault$ = mockOpenMultiplyVault({
      priceInfo: {
        collateralPrice: new BigNumber(2000),
      },
      exchangeQuote: {
        marketPrice: new BigNumber(2100),
      },
      ilkData: {
        debtFloor: new BigNumber(5000),
        liquidationRatio: new BigNumber(1.5),
      },
    })
    const state = getStateUnpacker(multiplyVault$)

    state().updateDeposit!(new BigNumber(100))

    const stateSnap = state()

    expect(stateSnap.maxCollRatio).to.deep.eq(new BigNumber(5))
  })
})
