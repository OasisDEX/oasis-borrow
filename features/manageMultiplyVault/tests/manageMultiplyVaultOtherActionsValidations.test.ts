import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

describe('manageVaultOtherActionsValidations', () => {
  it('validates if deposit amount exceeds collateral balance or depositing all ETH', () => {
    const depositAmountExceeds = new BigNumber('2')
    const depositAmountAll = new BigNumber('1')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        balanceInfo: {
          collateralBalance: new BigNumber('1'),
        },
        vault: {
          ilk: 'ETH-A',
        },
      }),
    )

    state().toggle!()
    state().updateDepositAmount!(depositAmountExceeds)
    expect(state().errorMessages).to.deep.equal(['depositAmountExceedsCollateralBalance'])
    state().updateDepositAmount!(depositAmountAll)
    expect(state().errorMessages).to.deep.equal(['depositingAllEthBalance'])
  })

  it(`validates if generate doesn't exceeds debt ceiling, debt floor`, () => {
    const generateAmountAboveCeiling = new BigNumber('30')
    const generateAmountBelowFloor = new BigNumber('9')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtCeiling: new BigNumber('8000025'),
          debtFloor: new BigNumber('2000'),
        },
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber(-0.1),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('withdrawDai')
    state().updateGenerateAmount!(generateAmountAboveCeiling)
    expect(state().errorMessages).to.deep.equal(['generateAmountExceedsDebtCeiling'])

    state().updateGenerateAmount!(generateAmountBelowFloor)
    expect(state().errorMessages).to.deep.equal(['generateAmountLessThanDebtFloor'])
  })

  it(`validates if generate amount is putting vault at risk, danger or exceeding day yield`, () => {
    const generateAmountExceedsYield = new BigNumber(1200)
    const generateAmountWarning = new BigNumber(100)
    const generateAmountDanger = new BigNumber(700)

    const generateAmountExceedsYieldNextPrice = new BigNumber(1000)
    const generateAmountWarningNextPrice = new BigNumber(40)
    const generateAmountDangerNextPrice = new BigNumber(500)

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3.4'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber('-0.05'),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('withdrawDai')
    state().updateGenerateAmount!(generateAmountExceedsYield)
    expect(state().errorMessages).to.deep.equal([
      'generateAmountExceedsDaiYieldFromTotalCollateral',
    ])

    state().updateGenerateAmount!(generateAmountWarning)
    expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarning'])

    state().updateGenerateAmount!(generateAmountDanger)
    expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelDanger'])

    state().updateGenerateAmount!(generateAmountExceedsYieldNextPrice)
    expect(state().errorMessages).to.deep.equal([
      'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
    ])

    state().updateGenerateAmount!(generateAmountWarningNextPrice)
    expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

    state().updateGenerateAmount!(generateAmountDangerNextPrice)
    expect(state().warningMessages).to.deep.equal([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])
  })

  it(`validates if withdraw amount is putting vault at risk, danger or exceeding free collateral`, () => {
    const withdrawAmountExceedsFreeCollateral = new BigNumber(1.2)
    const withdrawAmountWarning = new BigNumber(0.4)
    const withdrawAmountDanger = new BigNumber(0.85)

    const withdrawAmountExceedsFreeCollateralAtNextPrice = new BigNumber(1.1)
    const withdrawAmountWarningNextPrice = new BigNumber(0.05)
    const withdrawAmountDangerNextPrice = new BigNumber(0.65)

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('1500'),
        },
        vault: {
          collateral: new BigNumber('3.4'),
          debt: new BigNumber('1990'),
          ilk: 'ETH-A',
        },
        priceInfo: {
          ethChangePercentage: new BigNumber('-0.05'),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('withdrawCollateral')
    state().updateWithdrawAmount!(withdrawAmountExceedsFreeCollateral)
    expect(state().errorMessages).to.deep.equal(['withdrawAmountExceedsFreeCollateral'])

    state().updateWithdrawAmount!(withdrawAmountWarning)
    expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarning'])

    state().updateWithdrawAmount!(withdrawAmountDanger)
    expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelDanger'])

    state().updateWithdrawAmount!(withdrawAmountExceedsFreeCollateralAtNextPrice)
    expect(state().errorMessages).to.deep.equal(['withdrawAmountExceedsFreeCollateralAtNextPrice'])

    state().updateWithdrawAmount!(withdrawAmountWarningNextPrice)
    expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

    state().updateWithdrawAmount!(withdrawAmountDangerNextPrice)
    expect(state().warningMessages).to.deep.equal([
      'vaultWillBeAtRiskLevelDangerAtNextPrice',
      'vaultWillBeAtRiskLevelWarning',
    ])
  })

  it('validates custom allowance setting for collateral', () => {
    const depositAmount = new BigNumber('100')
    const customAllowanceAmount = new BigNumber('99')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        collateralAllowance: zero,
      }),
    )

    state().toggle!()
    state().updateDepositAmount!(depositAmount)

    state().progress!()
    expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')
    state().resetCollateralAllowanceAmount!()
    state().updateCollateralAllowanceAmount!(customAllowanceAmount)
    expect(state().collateralAllowanceAmount!).to.deep.equal(customAllowanceAmount)
    expect(state().errorMessages).to.deep.equal([
      'customCollateralAllowanceAmountLessThanDepositAmount',
    ])

    state().updateCollateralAllowanceAmount!(maxUint256.plus(new BigNumber('1')))
    expect(state().errorMessages).to.deep.equal([
      'customCollateralAllowanceAmountExceedsMaxUint256',
    ])
  })

  it('validates custom allowance setting for dai', () => {
    const paybackAmount = new BigNumber('100')
    const customAllowanceAmount = new BigNumber('99')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        daiAllowance: zero,
      }),
    )

    state().toggle!()
    state().setOtherAction!('depositDai')
    state().updatePaybackAmount!(paybackAmount)

    state().progress!()
    expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
    state().resetDaiAllowanceAmount!()
    state().updateDaiAllowanceAmount!(customAllowanceAmount)
    expect(state().daiAllowanceAmount!).to.deep.equal(customAllowanceAmount)
    expect(state().errorMessages).to.deep.equal(['customDaiAllowanceAmountLessThanPaybackAmount'])

    state().updateDaiAllowanceAmount!(maxUint256.plus(new BigNumber('1')))
    expect(state().errorMessages).to.deep.equal(['customDaiAllowanceAmountExceedsMaxUint256'])
  })

  it('validates payback amount', () => {
    const paybackAmountExceedsVaultDebt = new BigNumber('100')
    const paybackAmountNotEnough = new BigNumber('20')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber('30'),
        },
        vault: {
          debt: new BigNumber('40'),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('depositDai')
    state().updatePaybackAmount!(paybackAmountExceedsVaultDebt)
    expect(state().errorMessages).to.deep.equal(['paybackAmountExceedsVaultDebt'])

    state().updatePaybackAmount!(paybackAmountNotEnough)
    expect(state().errorMessages).to.deep.equal(['debtWillBeLessThanDebtFloor'])
  })

  it('validates if dai allowance is enough to payback whole amount and account debt offset', () => {
    const paybackAmount = new BigNumber('500')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        vault: {
          collateral: new BigNumber('31'),
          debt: new BigNumber('2000'),
        },
        daiAllowance: paybackAmount,
        priceInfo: {
          collateralPrice: new BigNumber('100'),
        },
      }),
    )

    state().toggle!()
    state().setOtherAction!('depositDai')
    state().updatePaybackAmount!(paybackAmount.plus(state().vault.debtOffset))
    expect(state().insufficientDaiAllowance).to.be.true

    state().updatePaybackAmount!(paybackAmount.minus(state().vault.debtOffset))
    expect(state().insufficientDaiAllowance).to.be.false

    state().updatePaybackAmount!(paybackAmount)
    expect(state().insufficientDaiAllowance).to.be.true

    state().progress!()
    expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
  })

  it('should show meaningful message when trying to withdraw collateral on dusty vault', () => {
    const withdrawAmount = new BigNumber('5')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        ilkData: {
          debtFloor: new BigNumber(1000),
        },
        vault: {
          debt: new BigNumber(100),
          collateral: new BigNumber(10),
        },
        balanceInfo: {
          daiBalance: new BigNumber(1000),
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        daiAllowance: zero,
      }),
    )

    state().toggle!()
    state().setOtherAction!('withdrawCollateral')

    state().updateWithdrawAmount!(withdrawAmount)
    expect(state().errorMessages).to.deep.eq([
      'generateAmountLessThanDebtFloor',
      'withdrawCollateralOnVaultUnderDebtFloor',
    ])
  })
})
