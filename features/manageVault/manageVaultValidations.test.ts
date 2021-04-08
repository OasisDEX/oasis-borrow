import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoWBTCAIlkData } from 'blockchain/ilks'
import { expect } from 'chai'
import { protoWBTCPriceInfo } from 'features/shared/priceInfo'
import { one, zero } from 'helpers/zero'
import _ from 'lodash'

import {
  applyManageVaultCalculations,
  defaultPartialManageVaultState,
  ManageVaultState,
} from './manageVault'
import { validateErrors, validateWarnings } from './manageVaultValidations'
const SLIGHTLY_LESS_THAN_ONE = 0.99
const SLIGHTLY_MORE_THAN_ONE = 1.01

describe('manageVaultValidations', () => {
  describe('validateWarnings', () => {
    const depositAmount = new BigNumber('10')
    const depositAmountUSD = depositAmount.multipliedBy(protoWBTCPriceInfo.currentCollateralPrice)
    const withdrawAmount = new BigNumber('10')
    const paybackAmount = new BigNumber('10')
    const {
      ilkDebtAvailable,
      maxDebtPerUnitCollateral,
      debtFloor,
      liquidationRatio,
      stabilityFee,
      liquidationPenalty,
    } = protoWBTCAIlkData

    const manageVaultState: ManageVaultState = applyManageVaultCalculations({
      ...defaultPartialManageVaultState,
      ...protoWBTCPriceInfo,
      id: one,
      ilk: 'WBTC-A',
      token: 'WBTC',
      account: '0x0',
      accountIsController: true,
      stabilityFee,
      liquidationPenalty,
      lockedCollateral: zero,
      lockedCollateralUSD: zero,
      debt: zero,
      liquidationPrice: zero,
      collateralizationRatio: zero,
      freeCollateral: zero,
      proxyAddress: '0xProxyAddress',
      ilkDebtAvailable,
      maxDebtPerUnitCollateral,
      debtFloor,
      liquidationRatio,
      generateAmount: new BigNumber('5000'),
      collateralAllowance: depositAmount,
      daiAllowance: paybackAmount,
      depositAmount,
      depositAmountUSD,
      withdrawAmount,
      paybackAmount,
      safeConfirmations: 6,
      collateralBalance: zero,
      ethBalance: zero,
      daiBalance: zero,
      injectStateOverride: (_state: Partial<ManageVaultState>) => _.noop(),
    })
    it('Should show no warnings when the state is correct', () => {
      const { warningMessages } = validateWarnings(manageVaultState)
      expect(warningMessages).to.be.an('array').that.is.empty
    })
    it('Should show noProxyAddress warning', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        proxyAddress: undefined,
      })
      expect(warningMessages).to.deep.equal(['noProxyAddress'])
    })
    it('Should show depositAmountEmpty warning', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        depositAmount: undefined,
      })
      expect(warningMessages).to.deep.equal(['depositAmountEmpty'])
    })
    it('Should show generateAmountEmpty warning', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        generateAmount: undefined,
      })
      expect(warningMessages).to.deep.equal(['generateAmountEmpty'])
    })

    it('Should show potentialGenerateAmountLessThanDebtFloor warning when debtFloor is slightly higher that depositAmountUSD', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        debtFloor: manageVaultState.depositAmountUSD!.multipliedBy(SLIGHTLY_MORE_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal(['potentialGenerateAmountLessThanDebtFloor'])
    })
    it('Should not show potentialGenerateAmountLessThanDebtFloor warning when debtFloor is slightly lower that depositAmountUSD', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        debtFloor: manageVaultState.depositAmountUSD!.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal([])
    })
    it('Should show noCollateralAllowance warning when allowance is not set', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        collateralAllowance: undefined,
      })
      expect(warningMessages).to.deep.equal(['noCollateralAllowance'])
    })
    it('Should show collateralAllowanceLessThanDepositAmount warning when allowance is zero', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        collateralAllowance: zero,
      })
      expect(warningMessages).to.deep.equal(['collateralAllowanceLessThanDepositAmount'])
    })
    it('Should show daiAllowanceLessThanPaybackAmount warning when allowance is not enough', () => {
      const { warningMessages } = validateWarnings({
        ...manageVaultState,
        daiAllowance: manageVaultState.paybackAmount!.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal(['daiAllowanceLessThanPaybackAmount'])
    })
  })

  describe('validateErrors', () => {
    const depositAmount = new BigNumber('10')
    const depositAmountUSD = depositAmount.multipliedBy(protoWBTCPriceInfo.currentCollateralPrice)
    const ilkDebtAvailable = new BigNumber('50000')
    const debtFloor = new BigNumber('2000')
    const withdrawAmount = new BigNumber('10')
    const paybackAmount = new BigNumber('10')
    const debt = new BigNumber(3000)
    const {
      maxDebtPerUnitCollateral,
      liquidationRatio,
      stabilityFee,
      liquidationPenalty,
    } = protoWBTCAIlkData

    const manageVaultState: ManageVaultState = applyManageVaultCalculations({
      ...defaultPartialManageVaultState,
      ...protoWBTCPriceInfo,
      token: 'WBTC',
      id: one,
      ilk: 'WBTC-A',
      account: '0x0',
      accountIsController: true,
      lockedCollateral: new BigNumber('100'),
      lockedCollateralUSD: new BigNumber('222232'),
      collateralBalance: new BigNumber('100'),
      proxyAddress: '0xProxyAddress',
      generateAmount: new BigNumber('5000'),
      collateralAllowance: depositAmount,
      daiAllowance: paybackAmount,
      maxDebtPerUnitCollateral,
      liquidationRatio,
      stabilityFee,
      liquidationPenalty,
      depositAmount,
      daiBalance: new BigNumber('10000'),
      liquidationPrice: zero,
      collateralizationRatio: zero,
      freeCollateral: new BigNumber('4000'),
      depositAmountUSD,
      withdrawAmount,
      paybackAmount,
      debtFloor,
      ilkDebtAvailable,
      safeConfirmations: 6,
      ethBalance: zero,
      debt,
      injectStateOverride: (_state: Partial<ManageVaultState>) => _.noop(),
    })
    it('Should show no errors when the state is correct', () => {
      const { errorMessages } = validateErrors(manageVaultState)
      expect(errorMessages).to.be.an('array').that.is.empty
    })
    it('Should show depositAmountGreaterThanMaxDepositAmount error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        maxDepositAmount: depositAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['depositAmountGreaterThanMaxDepositAmount'])
    })
    it('Should show withdrawAmountGreaterThanMaxWithdrawAmount error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        maxWithdrawAmount: withdrawAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['withdrawAmountGreaterThanMaxWithdrawAmount'])
    })
    it('Should show generateAmountLessThanDebtFloor error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        debt: zero,
        generateAmount: one,
      })
      expect(errorMessages).to.deep.equal(['generateAmountLessThanDebtFloor'])
    })
    it('Should show generateAmountGreaterThanDebtCeiling error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        generateAmount: ilkDebtAvailable.multipliedBy(SLIGHTLY_MORE_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['generateAmountGreaterThanDebtCeiling'])
    })
    it('Should show paybackAmountGreaterThanMaxPaybackAmount error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        maxPaybackAmount: paybackAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['paybackAmountGreaterThanMaxPaybackAmount'])
    })
    it('Should show paybackAmountLessThanDebtFloor error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        paybackAmount: debt.minus(debtFloor).plus(1),
      })
      expect(errorMessages).to.deep.equal(['paybackAmountLessThanDebtFloor'])
    })
    describe('Should validate allowance', () => {
      it('Should show daiAllowanceAmountEmpty error', () => {
        const { errorMessages } = validateErrors({
          ...manageVaultState,
          daiAllowanceAmount: undefined,
          stage: 'daiAllowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['daiAllowanceAmountEmpty'])
      })
      it('Should show customDaiAllowanceAmountGreaterThanMaxUint256 error', () => {
        const { errorMessages } = validateErrors({
          ...manageVaultState,
          daiAllowanceAmount: maxUint256.plus(1),
          stage: 'daiAllowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['customDaiAllowanceAmountGreaterThanMaxUint256'])
      })
      it('Should show customDaiAllowanceAmountLessThanPaybackAmount error', () => {
        const { errorMessages } = validateErrors({
          ...manageVaultState,
          daiAllowanceAmount: depositAmount.minus(1),
          stage: 'daiAllowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['customDaiAllowanceAmountLessThanPaybackAmount'])
      })
    })
    it('Should show vaultUnderCollateralized error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        afterCollateralizationRatio: new BigNumber(1.49),
        liquidationRatio: new BigNumber(1.5),
      })
      expect(errorMessages).to.deep.equal(['vaultUnderCollateralized'])
    })
  })
})
