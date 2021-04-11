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
      approximateDebt: zero,
      liquidationPrice: zero,
      collateralizationRatio: zero,
      nextCollateralizationRatio: zero,
      freeCollateral: zero,
      freeCollateralUSD: zero,
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
    it('should correctly show payingBackAllOutstandingDebt warning when paybackAmount is within one of outstanding debt', () => {
      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('2999.5'),
            debt: new BigNumber('2999.9999999999999999999995'),
            approximateDebt: new BigNumber('3000'),
            daiBalance: new BigNumber('10000'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal(['payingBackAllOutstandingDebt'])
      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('2999'),
            debt: new BigNumber('2999.9999999999999999999995'),
            approximateDebt: new BigNumber('3000'),
            daiBalance: new BigNumber('10000'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal(['payingBackAllOutstandingDebt'])
      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('3000'),
            debt: new BigNumber('2999.9999999999999999999995'),
            approximateDebt: new BigNumber('3000'),
            daiBalance: new BigNumber('10000'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal(['payingBackAllOutstandingDebt'])
      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('3000.01'),
            debt: new BigNumber('2999.9999999999999999999995'),
            approximateDebt: new BigNumber('3000'),
            daiBalance: new BigNumber('10000'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal([])

      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('3000'),
            debt: new BigNumber('2999.9999999999999999999995'),
            approximateDebt: new BigNumber('3000'),
            daiBalance: new BigNumber('2999'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal([])

      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('3000'),
            debt: new BigNumber('2999.9999995'),
            approximateDebt: new BigNumber('3000'),
            daiBalance: new BigNumber('10000'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal(['payingBackAllOutstandingDebt'])
      expect(
        validateWarnings(
          applyManageVaultCalculations({
            ...manageVaultState,
            paybackAmount: new BigNumber('3000'),
            debt: new BigNumber('2999.9999994'),
            approximateDebt: new BigNumber('2999.999999'),
            daiBalance: new BigNumber('10000'),
            daiAllowance: maxUint256,
          }),
        ).warningMessages,
      ).to.deep.equal([])
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
      nextCollateralizationRatio: zero,
      freeCollateral: new BigNumber('4000'),
      freeCollateralUSD: new BigNumber('4000').times(protoWBTCPriceInfo.currentCollateralPrice),
      depositAmountUSD,
      withdrawAmount,
      paybackAmount,
      debtFloor,
      ilkDebtAvailable,
      safeConfirmations: 6,
      ethBalance: zero,
      debt,
      approximateDebt: debt,
      injectStateOverride: (_state: Partial<ManageVaultState>) => _.noop(),
    })
    it('Should show no errors when the state is correct', () => {
      const { errorMessages } = validateErrors(manageVaultState)
      expect(errorMessages).to.be.an('array').that.is.empty
    })
    it('Should show depositAmountExceedsCollateralBalance error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        collateralBalance: depositAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['depositAmountExceedsCollateralBalance'])
    })
    it('Should show withdrawAmountExceedsFreeCollateral error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        freeCollateral: withdrawAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['withdrawAmountExceedsFreeCollateral'])
    })
    it('Should show generateAmountLessThanDebtFloor error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        debt: zero,
        generateAmount: one,
      })
      expect(errorMessages).to.deep.equal(['generateAmountLessThanDebtFloor'])
    })
    it('Should show generateAmountExceedsDebtCeiling error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        generateAmount: ilkDebtAvailable.multipliedBy(SLIGHTLY_MORE_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['generateAmountExceedsDebtCeiling'])
    })
    it('Should show paybackAmountExceedsVaultDebt error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        approximateDebt: paybackAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['paybackAmountExceedsVaultDebt'])
    })
    it('Should show paybackAmountLessThanDebtFloor error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        paybackAmount: debt.minus(debtFloor).plus(1),
      })
      expect(errorMessages).to.deep.equal(['paybackAmountCausesVaultDebtToBeLessThanDebtFloor'])
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
    it('Should show vaultWillBeUnderCollateralized error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        afterCollateralizationRatio: new BigNumber(1.49),
        liquidationRatio: new BigNumber(1.5),
      })
      expect(errorMessages).to.deep.equal(['vaultWillBeUnderCollateralized'])
    })
  })
})
