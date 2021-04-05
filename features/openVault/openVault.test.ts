/* eslint-disable func-style */
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
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
import { zero } from 'helpers/zero'
import _ from 'lodash'
import { beforeEach, describe, it } from 'mocha'
import { Observable, of } from 'rxjs'
import { first } from 'rxjs/operators'

import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'
import {
  applyOpenVaultCalculations,
  createOpenVault$,
  defaultPartialOpenVaultState,
  OpenVaultState,
} from './openVault'
import { parseVaultIdFromReceiptLogs } from './openVaultTransactions'
import { validateErrors, validateWarnings } from './openVaultValidations'

const SLIGHTLY_LESS_THAN_ONE = 0.99
const SLIGHTLY_MORE_THAN_ONE = 1.01

describe('openVault', () => {
  beforeEach(() => {})

  describe('parseVaultIdFromReceiptLogs', () => {
    it('should return vaultId', () => {
      const vaultId = parseVaultIdFromReceiptLogs(newCDPTxReceipt)
      expect(vaultId!.toString()).to.equal('3281')
    })
    it('should return undefined if NewCdp log is not found', () => {
      const vaultId = parseVaultIdFromReceiptLogs({ logs: [] })
      expect(vaultId).to.equal(undefined)
    })
  })

  describe('validateWarnings', () => {
    const depositAmount = new BigNumber('10')
    const {
      ilkDebtAvailable,
      maxDebtPerUnitCollateral,
      debtFloor,
      liquidationRatio,
    } = protoWBTCAIlkData
    const openVaultState: OpenVaultState = {
      ...defaultPartialOpenVaultState,
      ...protoWBTCPriceInfo,
      account: '0x0',
      ilk: 'WBTC-A',
      token: 'WBTC',
      ilkDebtAvailable,
      debtFloor,
      liquidationRatio,
      safeConfirmations: 5,
      maxDebtPerUnitCollateral,
      proxyAddress: '0xProxyAddress',
      depositAmount,
      depositAmountUSD: depositAmount.multipliedBy(protoWBTCPriceInfo.currentCollateralPrice),
      generateAmount: new BigNumber('5000'),
      allowance: depositAmount,
      collateralBalance: zero,
      ethBalance: zero,
      daiBalance: zero,
      injectStateOverride: () => {},
    }
    it('Should show no warnings when the state is correct', () => {
      const { warningMessages } = validateWarnings(openVaultState)
      expect(warningMessages).to.be.an('array').that.is.empty
    })
    it('Should show noProxyAddress warning', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        proxyAddress: undefined,
      })
      expect(warningMessages).to.deep.equal(['noProxyAddress'])
    })
    it('Should show depositAmountEmpty warning', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        depositAmount: undefined,
      })
      expect(warningMessages).to.deep.equal(['depositAmountEmpty'])
    })
    it('Should show generateAmountEmpty warning', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        generateAmount: undefined,
      })
      expect(warningMessages).to.deep.equal(['generateAmountEmpty'])
    })

    it('Should show potentialGenerateAmountLessThanDebtFloor warning when debtFloor is slightly higher that depositAmountUSD', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        debtFloor: openVaultState.depositAmountUSD!.multipliedBy(SLIGHTLY_MORE_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal(['potentialGenerateAmountLessThanDebtFloor'])
    })
    it('Should not show potentialGenerateAmountLessThanDebtFloor warning when debtFloor is slightly lower that depositAmountUSD', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        debtFloor: openVaultState.depositAmountUSD!.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal([])
    })
    it('Should show noAllowance warning when allowance is not set', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        allowance: undefined,
      })
      expect(warningMessages).to.deep.equal(['noAllowance'])
    })
    it('Should show noAllowance warning when allowance is zero', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        allowance: zero,
      })
      expect(warningMessages).to.deep.equal(['noAllowance', 'allowanceLessThanDepositAmount'])
    })
    it('Should show allowanceLessThanDepositAmount warning when allowance is not enough', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        allowance: openVaultState.depositAmount!.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal(['allowanceLessThanDepositAmount'])
    })
  })

  describe('validateErrors', () => {
    const depositAmount = new BigNumber('10')
    const depositAmountUSD = depositAmount.multipliedBy(protoWBTCPriceInfo.currentCollateralPrice)
    const maxDepositAmount = depositAmountUSD.multipliedBy(2)
    const ilkDebtAvailable = new BigNumber('50000')
    const debtFloor = new BigNumber('2000')
    const generateAmount = new BigNumber('5000')

    const { maxDebtPerUnitCollateral, liquidationRatio } = protoWBTCAIlkData

    const openVaultState: OpenVaultState = applyOpenVaultCalculations({
      ...defaultPartialOpenVaultState,
      ...protoWBTCPriceInfo,
      collateralBalance: maxDepositAmount.plus(10),
      ethBalance: zero,
      daiBalance: zero,
      account: '0x0',
      ilk: 'WBTC-A',
      token: 'WBTC',
      proxyAddress: '0xProxyAddress',
      depositAmount,
      depositAmountUSD,
      generateAmount,
      allowance: depositAmount,
      ilkDebtAvailable,
      maxDepositAmount,
      debtFloor,
      maxDebtPerUnitCollateral,
      liquidationRatio,
      safeConfirmations: 6,
      injectStateOverride: () => {},
    })

    it('Should show no errors when the state is correct', () => {
      const { errorMessages } = validateErrors(openVaultState)
      expect(errorMessages).to.be.an('array').that.is.empty
    })
    it('Should show depositAmountGreaterThanMaxDepositAmount error', () => {
      const { errorMessages } = validateErrors({
        ...openVaultState,
        maxDepositAmount: depositAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['depositAmountGreaterThanMaxDepositAmount'])
    })
    it('Should show generateAmountLessThanDebtFloor error', () => {
      const { errorMessages } = validateErrors({
        ...openVaultState,
        generateAmount: debtFloor.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['generateAmountLessThanDebtFloor'])
    })
    it('Should show generateAmountGreaterThanDebtCeiling error', () => {
      const { errorMessages } = validateErrors({
        ...openVaultState,
        generateAmount: ilkDebtAvailable.multipliedBy(SLIGHTLY_MORE_THAN_ONE),
      })
      expect(errorMessages).to.deep.equal(['generateAmountGreaterThanDebtCeiling'])
    })
    describe('Should validate allowance', () => {
      it('Should show allowanceAmountEmpty error', () => {
        const { errorMessages } = validateErrors({
          ...openVaultState,
          allowanceAmount: undefined,
          stage: 'allowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['allowanceAmountEmpty'])
      })
      it('Should show customAllowanceAmountGreaterThanMaxUint256 error', () => {
        const { errorMessages } = validateErrors({
          ...openVaultState,
          allowanceAmount: maxUint256.plus(1),
          stage: 'allowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['customAllowanceAmountGreaterThanMaxUint256'])
      })
      it('Should show customAllowanceAmountLessThanDepositAmount error', () => {
        const { errorMessages } = validateErrors({
          ...openVaultState,
          allowanceAmount: depositAmount.minus(1),
          stage: 'allowanceWaitingForConfirmation',
        })
        expect(errorMessages).to.deep.equal(['customAllowanceAmountLessThanDepositAmount'])
      })
    })
    it('Should show vaultUnderCollateralized error', () => {
      const { errorMessages } = validateErrors({
        ...openVaultState,
        afterCollateralizationRatio: new BigNumber(1.49),
        liquidationRatio: new BigNumber(1.5),
      })
      expect(errorMessages).to.deep.equal(['vaultUnderCollateralized'])
    })
  })
  describe('createOpenVault$', () => {
    type FixtureProps = Partial<OpenVaultState> & {
      title?: string
      context?: ContextConnected
      proxyAddress?: string
      allowance?: BigNumber
      ilks$?: Observable<string[]>
      priceInfo?: Partial<PriceInfo>
      balanceInfo?: Partial<BalanceInfo>
      ilk: string
      txHelpers?: TxHelpers
    }

    function createTestFixture({
      context,
      proxyAddress,
      allowance,
      ilks$,
      priceInfo,
      balanceInfo,
      ilk,
      txHelpers,
      stage,
      depositAmount,
      ...otherState
    }: FixtureProps) {
      const context$ = of(context || protoContextConnected)
      const txHelpers$ = of(txHelpers || protoTxHelpers)
      const proxyAddress$ = _.constant(of(proxyAddress))
      const allowance$ = _.constant(of(allowance || maxUint256))

      const protoBalanceInfo: BalanceInfo = {
        collateralBalance: zero,
        ethBalance: zero,
        daiBalance: zero,
        ...balanceInfo,
      }

      const protoPriceInfo = {
        ...(ilk === 'ETH-A'
          ? protoETHPriceInfo
          : ilk === 'WBTC-A'
          ? protoWBTCPriceInfo
          : protoUSDCPriceInfo),
        ...(priceInfo || {}),
      }

      const protoIlkData =
        ilk === 'ETH-A'
          ? protoETHAIlkData
          : ilk === 'WBTC-A'
          ? protoWBTCAIlkData
          : protoUSDCAIlkData

      const balanceInfo$ = () => of(protoBalanceInfo)
      const priceInfo$ = () => of(protoPriceInfo)
      const ilkData$ = () => of(protoIlkData)

      const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])
      const openVault$ = createOpenVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        ilks$ || of(['ETH-A', 'WBTC-A', 'USDC-A']),
        ilkToToken$,
        ilk,
      )

      const newState: Partial<OpenVaultState> = {
        ...otherState,
        ...(stage && { stage }),
        ...(depositAmount && {
          depositAmount,
          depositAmountUSD: depositAmount.times(protoPriceInfo.currentCollateralPrice),
        }),
      }

      openVault$.pipe(first()).subscribe(({ injectStateOverride }: any) => {
        if (injectStateOverride) {
          injectStateOverride(newState || {})
        }
      })
      return openVault$
    }

    it('Should start in an editing stage', () => {
      const state = getStateUnpacker(createTestFixture({ ilk: 'ETH-A' }))
      const s = state()
      expect(s.stage).to.be.equal('editing')
      expect(s.isIlkValidationStage).to.be.false
      expect(s.isEditingStage).to.be.true
    })

    it('editing.change()', () => {
      const depositAmount = new BigNumber(5)
      const state = getStateUnpacker(createTestFixture({ ilk: 'ETH-A' }))
      ;(state() as OpenVaultState).updateDeposit!(depositAmount)
      expect((state() as OpenVaultState).depositAmount!.toString()).to.be.equal(
        depositAmount.toString(),
      )
      expect(state().isEditingStage).to.be.true
    })

    it('editing.progress()', () => {
      const state = getStateUnpacker(createTestFixture({ ilk: 'ETH-A' }))
      ;(state() as OpenVaultState).progress!()
      expect(state().isProxyStage).to.be.true
      expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    })

    it('editing.progress(proxyAddress)', () => {
      const state = getStateUnpacker(
        createTestFixture({ ilk: 'ETH-A', proxyAddress: '0xProxyAddress' }),
      )
      ;(state() as OpenVaultState).progress!()
      expect(state().isOpenStage).to.be.true
      expect(state().stage).to.be.equal('openWaitingForConfirmation')
    })

    it('editing.progress(proxyAddress)', () => {
      const state = getStateUnpacker(
        createTestFixture({ ilk: 'ETH-A', proxyAddress: '0xProxyAddress' }),
      )
      ;(state() as OpenVaultState).progress!()
      expect(state().isOpenStage).to.be.true
      expect(state().stage).to.be.equal('openWaitingForConfirmation')
    })

    it('openWaitingForConfirmation.progress()', () => {
      const state = getStateUnpacker(
        createTestFixture({
          ilk: 'ETH-A',
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
                receipt: newCDPTxReceipt,
                confirmations: 15,
                safeConfirmations: 15,
              }
              return of(txState)
            },
          },
        }),
      )
      ;(state() as OpenVaultState).progress!()
      expect(state().isOpenStage).to.be.true
      expect(state().stage).to.be.equal('openWaitingForConfirmation')
      ;(state() as OpenVaultState).progress!()
      expect(state().isOpenStage).to.be.true
      expect(state().stage).to.be.equal('openSuccess')
      expect((state() as OpenVaultState).id!.toString()).to.be.equal('3281')
    })
  })
})
