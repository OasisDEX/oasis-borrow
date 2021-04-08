/* eslint-disable func-style */
import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { nullAddress } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { createVault$, Vault } from 'blockchain/vaults'
import { expect } from 'chai'
import { protoTxHelpers, TxHelpers } from 'components/AppContext'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import _ from 'lodash'
import { describe, it } from 'mocha'
import { Observable, of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'

import { BalanceInfo } from '../shared/balanceInfo'
import {
  PriceInfo,
  protoETHPriceInfo,
  protoUSDCPriceInfo,
  protoWBTCPriceInfo,
} from '../shared/priceInfo'
import {
  applyManageVaultCalculations,
  categoriseManageVaultStage,
  createManageVault$,
  defaultPartialManageVaultState,
  ManageVaultStage,
  ManageVaultState,
} from './manageVault'
import { validateErrors, validateWarnings } from './manageVaultValidations'
const SLIGHTLY_LESS_THAN_ONE = 0.99
const SLIGHTLY_MORE_THAN_ONE = 1.01

describe('manageVault', () => {
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
  describe('createManageVault$', () => {
    const protoUrnAddress = '0xEe0b6175705CDFEb824e5092d6547C011EbB46A8'

    type FixtureProps = Partial<ManageVaultState> & {
      context?: ContextConnected
      proxyAddress?: string
      allowance?: BigNumber
      vault?: Partial<Vault>
      priceInfo?: Partial<PriceInfo>
      balanceInfo?: Partial<BalanceInfo>
      urnAddress?: string
      owner?: string
      collateral?: BigNumber
      debt?: BigNumber
      unlockedCollateral?: BigNumber
      controller?: string
      depositAmount?: BigNumber
      withdrawAmount?: BigNumber
      generateAmount?: BigNumber
      paybackAmount?: BigNumber
      stage?: ManageVaultStage
      txHelpers?: TxHelpers
      ilk?: 'ETH-A' | 'WBTC-A' | 'USDC-A'
      id?: BigNumber
    }

    function createTestFixture({
      context,
      proxyAddress,
      allowance,
      priceInfo,
      balanceInfo,
      urnAddress,
      owner,
      ilk = 'ETH-A',
      collateral = new BigNumber(10),
      debt = new BigNumber(1000),
      unlockedCollateral,
      controller,
      depositAmount,
      withdrawAmount,
      generateAmount,
      paybackAmount,
      txHelpers,
      stage = 'collateralEditing',
      id = one,
    }: FixtureProps = {}) {
      const protoPriceInfo = {
        ...(ilk === 'ETH-A'
          ? protoETHPriceInfo
          : ilk === 'WBTC-A'
          ? protoWBTCPriceInfo
          : protoUSDCPriceInfo),
        ...(priceInfo || {}),
      }

      const protoBalanceInfo: BalanceInfo = {
        collateralBalance: zero,
        ethBalance: zero,
        daiBalance: zero,
        ...balanceInfo,
      }

      const balanceInfo$ = () => of(protoBalanceInfo)

      const protoIlkData =
        ilk === 'ETH-A'
          ? protoETHAIlkData
          : ilk === 'WBTC-A'
          ? protoWBTCAIlkData
          : protoUSDCAIlkData

      const context$ = of(context || protoContextConnected)
      const txHelpers$ = of(txHelpers || protoTxHelpers)
      const proxyAddress$ = () => of(proxyAddress)
      const allowance$ = () => of(allowance || maxUint256)

      const priceInfo$ = () => of(protoPriceInfo)

      const oraclePriceData$ = () =>
        of(protoPriceInfo).pipe(
          switchMap(({ currentCollateralPrice }) => {
            return of({ currentPrice: currentCollateralPrice, isStaticPrice: true })
          }),
        )

      const ilkData$ = () => of(protoIlkData)

      const normalizedDebt = debt
        .div(protoIlkData.debtScalingFactor)
        .decimalPlaces(18, BigNumber.ROUND_DOWN)

      const cdpManagerUrns$ = () => of(urnAddress || protoUrnAddress)
      const cdpManagerIlks$ = () => of(ilk || 'ETH-A')
      const cdpManagerOwner$ = () => of(owner || proxyAddress || nullAddress)

      const vatUrns$ = () => of({ collateral, normalizedDebt })
      const vatGem$ = () => of(unlockedCollateral || zero)

      const controller$ = () => of(controller || context?.account || protoContextConnected.account)
      const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])

      const vault$ = () =>
        createVault$(
          cdpManagerUrns$,
          cdpManagerIlks$,
          cdpManagerOwner$,
          vatUrns$,
          vatGem$,
          ilkData$,
          oraclePriceData$,
          controller$,
          ilkToToken$,
          id,
        )

      const manageVault$ = createManageVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        id,
      )

      const newState: Partial<ManageVaultState> = {
        ...(stage && { stage }),
        ...(depositAmount && {
          depositAmount,
          depositAmountUSD: depositAmount.times(protoPriceInfo.currentCollateralPrice),
        }),
        ...(withdrawAmount && {
          withdrawAmount,
          withdrawAmountUSD: withdrawAmount.times(protoPriceInfo.currentCollateralPrice),
        }),
        ...(generateAmount && {
          generateAmount,
        }),
        ...(paybackAmount && {
          paybackAmount,
        }),
      }

      manageVault$.pipe(first()).subscribe(({ injectStateOverride }: any) => {
        if (injectStateOverride) {
          injectStateOverride(newState || {})
        }
      })

      return manageVault$
    }

    function createMockTxState<T extends TxMeta>(
      meta: T,
      status: TxStatus = TxStatus.Success,
      receipt: unknown = {},
    ): Observable<TxState<T>> {
      if (status === TxStatus.Success) {
        const txState = {
          account: '0x',
          txNo: 0,
          networkId: '1',
          meta,
          start: new Date(),
          lastChange: new Date(),
          dismissed: false,
          status,
          txHash: '0xhash',
          blockNumber: 0,
          receipt,
          confirmations: 15,
          safeConfirmations: 15,
        }
        return of(txState)
      } else if (status === TxStatus.Failure) {
        const txState = {
          account: '0x',
          txNo: 0,
          networkId: '1',
          meta,
          start: new Date(),
          lastChange: new Date(),
          dismissed: false,
          status,
          txHash: '0xhash',
          blockNumber: 0,
          receipt,
        }
        return of(txState)
      } else {
        throw new Error('Not implemented yet')
      }
    }

    it('Should start in an editing stage', () => {
      const state = getStateUnpacker(createTestFixture())
      const s = state()
      expect(s.stage).to.be.equal('collateralEditing')
    })

    it('collateral-editing.updateDeposit()', () => {
      const depositAmount = new BigNumber(5)
      const state = getStateUnpacker(createTestFixture())
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
      expect(state().stage).to.be.equal('collateralEditing')
    })

    it('collateral-editing.updateDepositUSD()', () => {
      const depositAmount = new BigNumber(5)
      const depositAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(depositAmount)
      const state = getStateUnpacker(createTestFixture())
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
      expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
    })

    it('collateral-editing.updateGenerate()', () => {
      const depositAmount = new BigNumber(5)
      const generateAmount = new BigNumber(1000)
      const state = getStateUnpacker(createTestFixture())
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount).to.be.undefined
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount).to.be.undefined
      state().toggleDepositAndGenerateOption!()
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!.toString()).to.be.equal(generateAmount.toString())
    })

    it('collateral-editing.updateWithdraw()', () => {
      const withdrawAmount = new BigNumber(5)
      const state = getStateUnpacker(createTestFixture())
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount!.toString()).to.be.equal(withdrawAmount.toString())
    })

    it('collateral-editing.updateWithdrawUSD()', () => {
      const withdrawAmount = new BigNumber(5)
      const withdrawAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(withdrawAmount)
      const state = getStateUnpacker(createTestFixture())
      state().updateWithdrawUSD!(withdrawAmountUSD)
      expect(state().withdrawAmount!.toString()).to.be.equal(withdrawAmount.toString())
      expect(state().withdrawAmountUSD!.toString()).to.be.equal(withdrawAmountUSD.toString())
    })

    it('collateral-editing.updatePayback()', () => {
      const withdrawAmount = new BigNumber(5)
      const paybackAmount = new BigNumber(1000)
      const state = getStateUnpacker(createTestFixture())
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount).to.be.undefined
      state().updateWithdraw!(withdrawAmount)
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount).to.be.undefined
      state().togglePaybackAndWithdrawOption!()
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!.toString()).to.be.equal(paybackAmount.toString())
    })

    it('dai-editing.updateGenerate()', () => {
      const generateAmount = new BigNumber(1000)
      const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!.toString()).to.be.equal(generateAmount.toString())
    })

    it('dai-editing.updateDeposit()', () => {
      const generateAmount = new BigNumber(1000)
      const depositAmount = new BigNumber(5)
      const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount).to.be.undefined
      state().updateGenerate!(generateAmount)
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount).to.be.undefined
      state().toggleDepositAndGenerateOption!()
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    })

    it('dai-editing.updateDepositUSD()', () => {
      const generateAmount = new BigNumber(1000)
      const depositAmount = new BigNumber(5)
      const depositAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(depositAmount)
      const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount).to.be.undefined
      state().updateGenerate!(generateAmount)
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount).to.be.undefined
      state().toggleDepositAndGenerateOption!()
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
      expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
    })

    it('dai-editing.updatePayback()', () => {
      const paybackAmount = new BigNumber(1000)
      const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!.toString()).to.be.equal(paybackAmount.toString())
    })

    it('dai-editing.updateWithdraw()', () => {
      const paybackAmount = new BigNumber(1000)
      const withdrawAmount = new BigNumber(5)
      const withdrawAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(withdrawAmount)
      const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
      state().updateWithdrawUSD!(withdrawAmountUSD)
      expect(state().withdrawAmount).to.be.undefined
      state().updatePayback!(paybackAmount)
      state().updateWithdrawUSD!(withdrawAmountUSD)
      expect(state().withdrawAmount).to.be.undefined
      state().togglePaybackAndWithdrawOption!()
      state().updateWithdrawUSD!(withdrawAmountUSD)
      expect(state().withdrawAmount!.toString()).to.be.equal(withdrawAmount.toString())
      expect(state().withdrawAmountUSD!.toString()).to.be.equal(withdrawAmountUSD.toString())
    })

    it('editing.progress()', () => {
      const state = getStateUnpacker(createTestFixture())
      state().progress!()
      expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    })

    it('editing.progress(proxyAddress)', () => {
      const state = getStateUnpacker(createTestFixture({ proxyAddress: '0xProxyAddress' }))
      state().progress!()
      expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    })

    it('editing.progress(proxyAddress)', () => {
      const state = getStateUnpacker(createTestFixture({ proxyAddress: '0xProxyAddress' }))
      state().progress!()
      expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    })

    it('manageWaitingForConfirmation.progress()', () => {
      const state = getStateUnpacker(
        createTestFixture({
          proxyAddress: '0xProxyAddress',
          txHelpers: {
            ...protoTxHelpers,
            send: <B extends TxMeta>(_open: any, meta: B) => createMockTxState(meta),
          },
        }),
      )
      state().progress!()
      expect(state().stage).to.be.equal('manageWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.be.equal('manageSuccess')
    })
  })

  describe('openVault stage categories', () => {
    it('should identify editing stage correctly', () => {
      expect(categoriseManageVaultStage('collateralEditing').isEditingStage).to.be.true
      expect(categoriseManageVaultStage('daiEditing').isEditingStage).to.be.true
    })

    it('should identify proxy stages correctly', () => {
      expect(categoriseManageVaultStage('proxyWaitingForConfirmation').isProxyStage).to.be.true
      expect(categoriseManageVaultStage('proxyWaitingForApproval').isProxyStage).to.be.true
      expect(categoriseManageVaultStage('proxyInProgress').isProxyStage).to.be.true
      expect(categoriseManageVaultStage('proxyFailure').isProxyStage).to.be.true
      expect(categoriseManageVaultStage('proxySuccess').isProxyStage).to.be.true
    })

    it('should identify collateral allowance stages correctly', () => {
      expect(
        categoriseManageVaultStage('collateralAllowanceWaitingForConfirmation')
          .isCollateralAllowanceStage,
      ).to.be.true
      expect(
        categoriseManageVaultStage('collateralAllowanceWaitingForApproval')
          .isCollateralAllowanceStage,
      ).to.be.true
      expect(categoriseManageVaultStage('collateralAllowanceInProgress').isCollateralAllowanceStage)
        .to.be.true
      expect(categoriseManageVaultStage('collateralAllowanceFailure').isCollateralAllowanceStage).to
        .be.true
      expect(categoriseManageVaultStage('collateralAllowanceSuccess').isCollateralAllowanceStage).to
        .be.true
    })

    it('should identify dai allowance stages correctly', () => {
      expect(categoriseManageVaultStage('daiAllowanceWaitingForConfirmation').isDaiAllowanceStage)
        .to.be.true
      expect(categoriseManageVaultStage('daiAllowanceWaitingForApproval').isDaiAllowanceStage).to.be
        .true
      expect(categoriseManageVaultStage('daiAllowanceInProgress').isDaiAllowanceStage).to.be.true
      expect(categoriseManageVaultStage('daiAllowanceFailure').isDaiAllowanceStage).to.be.true
      expect(categoriseManageVaultStage('daiAllowanceSuccess').isDaiAllowanceStage).to.be.true
    })

    it('should identify manage stages correctly', () => {
      expect(categoriseManageVaultStage('manageWaitingForConfirmation').isManageStage).to.be.true
      expect(categoriseManageVaultStage('manageWaitingForApproval').isManageStage).to.be.true
      expect(categoriseManageVaultStage('manageInProgress').isManageStage).to.be.true
      expect(categoriseManageVaultStage('manageFailure').isManageStage).to.be.true
      expect(categoriseManageVaultStage('manageSuccess').isManageStage).to.be.true
    })
  })
})
