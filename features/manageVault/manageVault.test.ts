/* eslint-disable func-style */
import { TxStatus } from '@oasisdex/transactions'
import { nullAddress } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { createVault$, Vault } from 'blockchain/vaults'
import { expect } from 'chai'
import { protoTxHelpers, TxHelpers } from 'components/AppContext'
import { BalanceInfo } from 'features/shared/balanceInfo'
import {
  PriceInfo,
  protoETHPriceInfo,
  protoUSDCPriceInfo,
  protoWBTCPriceInfo,
} from 'features/shared/priceInfo'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import { describe, it } from 'mocha'
import { of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'

import {
  applyManageVaultCalculations,
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
      injectStateOverride: () => {},
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
      debt: new BigNumber('10000'),
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
      injectStateOverride: () => {},
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
    it('Should show generateAmountLessThanDebtFloor error', () => {
      const { errorMessages } = validateErrors({
        ...manageVaultState,
        debt: zero,
        generateAmount: debtFloor.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
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
    describe('Should validate allowance', () => {
      it('Should show allowanceAmountEmpty error', () => {
        const { errorMessages } = validateErrors({
          ...manageVaultState,
          daiAllowanceAmount: undefined,
          stage: 'daiAllowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['daiAllowanceAmountEmpty'])
      })
      it('Should show customAllowanceAmountGreaterThanMaxUint256 error', () => {
        const { errorMessages } = validateErrors({
          ...manageVaultState,
          daiAllowanceAmount: maxUint256.plus(1),
          stage: 'daiAllowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['customDaiAllowanceAmountGreaterThanMaxUint256'])
      })
      it('Should show customAllowanceAmountLessThanDepositAmount error', () => {
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
      collateral: BigNumber
      debt: BigNumber
      unlockedCollateral?: BigNumber
      controller?: string
      depositAmount?: BigNumber
      withdrawAmount?: BigNumber
      generateAmount?: BigNumber
      paybackAmount?: BigNumber
      stage?: ManageVaultStage
      txHelpers?: TxHelpers
      ilk: 'ETH-A' | 'WBTC-A' | 'USDC-A'
      id: BigNumber
    }

    function createTestFixture({
      context,
      proxyAddress,
      allowance,
      priceInfo,
      balanceInfo,
      urnAddress,
      owner,
      ilk,
      collateral,
      debt,
      unlockedCollateral,
      controller,
      depositAmount,
      withdrawAmount,
      generateAmount,
      paybackAmount,
      txHelpers,
      stage,
      id,
    }: FixtureProps) {
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

    const defaults = {
      ilk: 'ETH-A' as 'ETH-A',
      id: zero,
      debt: new BigNumber(1000),
      collateral: new BigNumber(10),
    }

    it('Should start in an editing stage', () => {
      const state = getStateUnpacker(createTestFixture(defaults))
      const s = state()
      expect(s.stage).to.be.equal('collateralEditing')
      expect(s.isEditingStage).to.be.true
    })

    it('editing.change()', () => {
      const depositAmount = new BigNumber(5)
      const state = getStateUnpacker(createTestFixture(defaults))
      ;(state() as ManageVaultState).updateDeposit!(depositAmount)
      expect((state() as ManageVaultState).depositAmount!.toString()).to.be.equal(
        depositAmount.toString(),
      )
      expect(state().isEditingStage).to.be.true
    })

    it('editing.progress()', () => {
      const state = getStateUnpacker(createTestFixture(defaults))
      ;(state() as ManageVaultState).progress!()
      expect(state().isProxyStage).to.be.true
      expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    })

    it('editing.progress(proxyAddress)', () => {
      const state = getStateUnpacker(
        createTestFixture({ ...defaults, proxyAddress: '0xProxyAddress' }),
      )
      ;(state() as ManageVaultState).progress!()
      expect(state().isManageStage).to.be.true
      expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    })

    it('editing.progress(proxyAddress)', () => {
      const state = getStateUnpacker(
        createTestFixture({ ...defaults, proxyAddress: '0xProxyAddress' }),
      )
      ;(state() as ManageVaultState).progress!()
      expect(state().isManageStage).to.be.true
      expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    })

    it('manageWaitingForConfirmation.progress()', () => {
      const state = getStateUnpacker(
        createTestFixture({
          ...defaults,
          proxyAddress: '0xProxyAddress',
          txHelpers: {
            // @ts-ignore
            send: <B>(_open: any, meta: B) => {
              const txState = {
                account: '0x',
                txNo: 0,
                networkId: '1',
                meta,
                start: Date.now(),
                lastChange: Date.now(),
                dismissed: false,
                status: TxStatus.Success,
                txHash: '0xhash',
                blockNumber: 0,
                receipt: { logs: [] },
                confirmations: 15,
                safeConfirmations: 15,
              }
              return of(txState)
            },
          },
        }),
      )
      ;(state() as ManageVaultState).progress!()
      expect(state().isManageStage).to.be.true
      expect(state().stage).to.be.equal('manageWaitingForConfirmation')
      ;(state() as ManageVaultState).progress!()
      expect(state().isManageStage).to.be.true
      expect(state().stage).to.be.equal('manageSuccess')
    })
  })
})
