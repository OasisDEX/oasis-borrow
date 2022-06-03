/* eslint-disable func-style */

import { TxMeta, TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { mockTxState } from 'helpers/mocks/txHelpers.mock'
import { DEFAULT_PROXY_ADDRESS, defaultCollateral, defaultDebt } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { legacyToggle } from './legacyToggle'

type GlobalMock = NodeJS.Global & { document: { getElementById: () => void } }
;(global as GlobalMock).document = {
  getElementById: () => null,
}

describe('manageMultiplyVault', () => {
  describe('manageMultiplyVault$', () => {
    describe('adjust position', () => {
      it('should start by default in an adjust position stage', () => {
        const state = getStateUnpacker(mockManageMultiplyVault$())
        expect(state().stage).to.be.equal('adjustPosition')
        expect(state().vault.lockedCollateral).to.deep.equal(defaultCollateral)
        expect(state().vault.debt).to.deep.equal(defaultDebt)

        expect(state().totalSteps).to.deep.equal(3)
      })

      it('should start by default in an other actions deposit collateral if vault has zero collateral', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: zero,
            },
          }),
        )
        expect(state().stage).to.be.equal('otherActions')
        expect(state().otherAction).to.be.equal('depositCollateral')
        expect(state().vault.lockedCollateral).to.deep.equal(zero)

        expect(state().totalSteps).to.deep.equal(3)
      })

      it('should update required collateralization ratio', () => {
        const requiredCollRatio = new BigNumber('2')
        const state = getStateUnpacker(mockManageMultiplyVault$())

        state().updateRequiredCollRatio!(requiredCollRatio)
        expect(state().requiredCollRatio).to.deep.equal(requiredCollRatio)
      })
      // TODO to be used when buy / sell functionality will be available on UI
      //   it('should update buy, buyUSD, buyMax, sell, sellUSD and sellMax amount inputs on proper main action and when slider is hidden', () => {
      //     const buyAmount = new BigNumber('2')
      //     const buyAmountUSD = new BigNumber('2')
      //     const sellAmount = new BigNumber('3')
      //     const sellAmountUSD = new BigNumber('3')
      //
      //     const state = getStateUnpacker(mockManageMultiplyVault$())
      //
      //     state().updateBuy!(buyAmount)
      //     expect(state().buyAmount).to.be.undefined
      //     state().updateBuyUSD!(buyAmountUSD)
      //     expect(state().buyAmountUSD).to.be.undefined
      //
      //     state().updateSell!(sellAmount)
      //     expect(state().sellAmount).to.be.undefined
      //     state().updateSellUSD!(sellAmountUSD)
      //     expect(state().sellAmountUSD).to.be.undefined
      //
      //     state().toggleSliderController!()
      //     state().updateBuy!(buyAmount)
      //     expect(state().buyAmount).to.deep.equal(buyAmount)
      //     state().updateBuyUSD!(buyAmountUSD)
      //     expect(state().buyAmountUSD).to.deep.equal(buyAmountUSD)
      //     state().updateBuyMax!()
      //     expect(state().buyAmount).to.deep.equal(state().maxBuyAmount)
      //
      //     state().updateSell!(sellAmount)
      //     expect(state().sellAmount).to.be.undefined
      //
      //     state().setMainAction!('sell')
      //     state().updateSell!(sellAmount)
      //     expect(state().sellAmount).to.deep.equal(sellAmount)
      //     state().updateSellUSD!(sellAmountUSD)
      //     expect(state().sellAmountUSD).to.deep.equal(sellAmountUSD)
      //     state().updateSellMax!()
      //     expect(state().sellAmount).to.deep.equal(state().vault.freeCollateral)
      //
      //     state().updateBuy!(buyAmount)
      //     expect(state().buyAmount).to.be.undefined
      //   })
    })

    describe('other actions', () => {
      it('should toggle to otherAction stage', () => {
        const state = getStateUnpacker(mockManageMultiplyVault$())

        expect(state().stage).to.deep.equal('adjustPosition')
        legacyToggle(state())
        expect(state().stage).to.deep.equal('otherActions')
      })

      it('should update deposit amount, deposit amount USD, deposit max with collateral balance and reset value on otherAction change', () => {
        const depositAmount = new BigNumber('5')
        const depositAmountUSD = new BigNumber('10')
        const collateralBalance = new BigNumber('20')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            balanceInfo: {
              collateralBalance,
            },
          }),
        )

        legacyToggle(state())
        expect(state().stage).to.deep.equal('otherActions')
        expect(state().otherAction).to.deep.equal('depositCollateral')

        state().updateDepositAmount!(depositAmount)
        expect(state().depositAmount!).to.deep.equal(depositAmount)

        state().updateDepositAmountUSD!(depositAmountUSD)
        expect(state().depositAmountUSD!).to.deep.equal(depositAmountUSD)

        state().updateDepositAmountMax!()
        expect(state().depositAmount!).to.deep.equal(state().maxDepositAmount)
        expect(state().depositAmountUSD!).to.deep.equal(state().maxDepositAmountUSD)

        state().setOtherAction!('withdrawCollateral')
        expect(state().depositAmount!).to.be.undefined
      })

      it('should update withdraw amount, withdraw amount USD and withdraw max  and reset value on otherAction change', () => {
        const withdrawAmount = new BigNumber('5')
        const withdrawAmountUSD = new BigNumber('10')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )

        legacyToggle(state())
        state().setOtherAction!('withdrawCollateral')
        expect(state().otherAction).to.deep.equal('withdrawCollateral')

        state().updateWithdrawAmount!(withdrawAmount)
        expect(state().withdrawAmount).to.deep.equal(withdrawAmount)

        state().updateWithdrawAmountUSD!(withdrawAmountUSD)
        expect(state().withdrawAmountUSD).to.deep.equal(withdrawAmountUSD)

        state().updateWithdrawAmountMax!()
        expect(state().withdrawAmount).to.deep.equal(state().maxWithdrawAmount)
        expect(state().withdrawAmountUSD).to.deep.equal(state().maxWithdrawAmountUSD)
      })

      it('should update generate amount amount, generate amount max and reset value on otherAction change', () => {
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(mockManageMultiplyVault$())

        legacyToggle(state())
        state().setOtherAction!('withdrawDai')
        expect(state().otherAction).to.deep.equal('withdrawDai')

        state().updateGenerateAmount!(generateAmount)
        expect(state().generateAmount!).to.deep.equal(generateAmount)

        state().updateGenerateAmountMax!()

        expect(state().generateAmount).to.deep.equal(state().maxGenerateAmount)

        state().setOtherAction!('paybackDai')
        expect(state().generateAmount!).to.be.undefined
      })

      it('should update payback amount when withdrawAmount is defined & option is true', () => {
        const paybackAmount = new BigNumber('1000')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )

        legacyToggle(state())
        state().setOtherAction!('paybackDai')
        expect(state().otherAction).to.deep.equal('paybackDai')

        state().updatePaybackAmount!(paybackAmount)
        expect(state().paybackAmount!).to.deep.equal(paybackAmount)

        state().updatePaybackAmountMax!()
        expect(state().paybackAmount!).to.deep.equal(state().maxPaybackAmount)

        state().setOtherAction!('withdrawDai')
        expect(state().paybackAmount!).to.be.undefined
      })

      it('should be able to go to closeVault and toggle between collateral and DAI', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )

        legacyToggle(state())
        state().setOtherAction!('closeVault')
        expect(state().closeVaultTo).to.deep.equal('collateral')
        state().setCloseVaultTo!('dai')
        expect(state().closeVaultTo).to.deep.equal('dai')
        state().setCloseVaultTo!('collateral')
        expect(state().closeVaultTo).to.deep.equal('collateral')
      })
    })

    describe('editing progressions', () => {
      it('should progress from adjust position to manage vault confirmation', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: maxUint256,
          }),
        )

        expect(state().totalSteps).to.deep.equal(2)
        state().updateRequiredCollRatio!(new BigNumber(2))
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
      })

      it('should progress from other actions to manage vault confirmation', () => {
        const depositAmount = new BigNumber('5')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: maxUint256,
          }),
        )

        legacyToggle(state())
        state().updateDepositAmount!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
      })

      it('validates if deposit amount leads to potential insufficient ETH funds for tx (ETH ilk case)', () => {
        const depositAlmostAll = new BigNumber(10.9999)

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              ilk: 'ETH-A',
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            balanceInfo: {
              ethBalance: new BigNumber(11),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            gasEstimationUsd: new BigNumber(30),
          }),
        )

        state().updateDepositAmount!(depositAlmostAll)
        expect(state().warningMessages).to.deep.equal(['potentialInsufficientEthFundsForTx'])
      })

      it('validates if deposit amount leads to potential insufficient ETH funds for tx (other ilk case)', () => {
        const depositAmount = new BigNumber(10)

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              ilk: 'WBTC-A',
              collateral: new BigNumber('40'),
              debt: new BigNumber('3000'),
            },
            balanceInfo: {
              ethBalance: new BigNumber(0.001),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            gasEstimationUsd: new BigNumber(30),
          }),
        )

        state().updateDepositAmount!(depositAmount)
        expect(state().warningMessages).to.deep.equal(['potentialInsufficientEthFundsForTx'])
      })

      it('should progress from editing to proxyWaitingForConfirmation if no proxy exists', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )

        state().updateRequiredCollRatio!(new BigNumber(2))
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
      })

      it('should progress from otherAction to collateralAllowance flow if user has proxy but insufficent allowance for deposit amount', () => {
        const depositAmount = new BigNumber('5')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
              ilk: 'WBTC-A',
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: zero,
          }),
        )

        expect(state().totalSteps).to.deep.equal(2)
        legacyToggle(state())
        state().updateDepositAmount!(depositAmount)
        expect(state().totalSteps).to.deep.equal(3)
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')
        expect(state().currentStep).to.deep.equal(2)
      })

      it('should progress from otherAction to daiAllowance flow if user has proxy but insufficent allowance for payback amount', () => {
        const paybackAmount = new BigNumber('5000')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('10000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            daiAllowance: zero,
          }),
        )

        legacyToggle(state())
        state().setOtherAction!('paybackDai')
        state().updatePaybackAmount!(paybackAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
      })

      it('should update totalSteps if allowances amount are less than deposit or payback amount depending on otherAction', () => {
        const daiAllowance = new BigNumber('1000')
        const collateralAllowance = new BigNumber('1000')

        const paybackAmount = new BigNumber('5000')
        const depositAmount = new BigNumber('5000')
        const withdrawAmount = new BigNumber('5000')
        const generateAmount = new BigNumber('5000')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('10000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            daiAllowance,
            collateralAllowance,
          }),
        )

        expect(state().totalSteps).to.deep.equal(2)
        legacyToggle(state())
        state().updateDepositAmount!(depositAmount)
        expect(state().totalSteps).to.deep.equal(3)

        state().setOtherAction!('withdrawCollateral')
        state().updateWithdrawAmount!(withdrawAmount)
        expect(state().totalSteps).to.deep.equal(2)

        state().setOtherAction!('paybackDai')
        state().updatePaybackAmount!(paybackAmount)
        expect(state().totalSteps).to.deep.equal(3)

        state().setOtherAction!('withdrawDai')
        state().updateGenerateAmount!(generateAmount)
        expect(state().totalSteps).to.deep.equal(2)
      })

      it('should clear form values and go to editing stage', () => {
        const requiredCollRatio = new BigNumber('2')

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: maxUint256,
            vault: {
              ilk: 'WBTC-A',
            },
          }),
        )

        state().updateRequiredCollRatio!(requiredCollRatio)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')

        state().clear()
        expect(state().stage).to.deep.equal('adjustPosition')
        expect(state().requiredCollRatio).to.be.undefined
      })
    })

    describe('create proxy flow', () => {
      it('should instigate proxy tx correctly', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.WaitingForApproval),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )

        state().updateRequiredCollRatio!(new BigNumber('2'))
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForApproval')
      })

      it('should handle in progress case', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.WaitingForConfirmation),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )
        state().updateRequiredCollRatio!(new BigNumber('2'))
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('proxyInProgress')
      })

      it('should handle fail case and back to editing after', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.Failure),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )

        state().updateRequiredCollRatio!(new BigNumber('2'))
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('proxyFailure')
        state().regress!()
        expect(state().stage).to.deep.equal('adjustPosition')
      })

      it('should handle proxy success case and progress to collateralAllowanceWaitingForConfirmation', () => {
        const _proxyAddress$ = new Subject<string>()
        const depositAmount = new BigNumber(5)
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _proxyAddress$,
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.Success),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
              ilk: 'WBTC-A',
            },
            collateralAllowance: zero,
          }),
        )

        _proxyAddress$.next()
        expect(state().proxyAddress).to.be.undefined

        legacyToggle(state())
        state().updateDepositAmount!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
        expect(state().stage).to.deep.equal('proxySuccess')
        expect(state().proxyAddress).to.deep.equal(DEFAULT_PROXY_ADDRESS)
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')
      })

      it('should handle proxy success case and progress to daiAllowanceWaitingForConfirmation', () => {
        const _proxyAddress$ = new Subject<string>()
        const paybackAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _proxyAddress$,
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.Success),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )

        _proxyAddress$.next()
        expect(state().proxyAddress).to.be.undefined
        legacyToggle(state())
        state().setOtherAction!('paybackDai')
        state().updatePaybackAmount!(paybackAmount)

        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
        expect(state().stage).to.deep.equal('proxySuccess')
        expect(state().proxyAddress).to.deep.equal(DEFAULT_PROXY_ADDRESS)
        state().progress!()
        expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
      })
    })

    describe('Manage tx flow', () => {
      it('should instigate tx correctly', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.WaitingForApproval),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
          }),
        )

        state().updateRequiredCollRatio!(new BigNumber(2))
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForApproval')
      })

      it('should handle in progress case', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.WaitingForConfirmation),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
          }),
        )

        state().updateRequiredCollRatio!(new BigNumber('2'))
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageInProgress')
      })

      it('should handle fail case', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.Failure),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
          }),
        )
        state().updateRequiredCollRatio!(new BigNumber('2'))
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageFailure')
        state().regress!()
        expect(state().stage).to.deep.equal('adjustPosition')
      })

      it('should handle success case', () => {
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
                mockTxState(meta, TxStatus.Success),
            }),
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
          }),
        )
        state().updateRequiredCollRatio!(new BigNumber('2'))
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageSuccess')
        state().progress!()
        expect(state().stage).to.deep.equal('adjustPosition')
      })
    })

    describe('manage allowances', () => {
      it('should handle collateral allowance inputs, going back and forth and setting collateral allowance', () => {
        const depositAmount = new BigNumber('5')
        const customAllowanceAmount = new BigNumber(10)

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
            }),
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: zero,
          }),
        )

        legacyToggle(state())

        state().updateDepositAmount!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')

        state().setCollateralAllowanceAmountToDepositAmount!()
        expect(state().collateralAllowanceAmount).to.deep.equal(depositAmount)
        state().resetCollateralAllowanceAmount!()
        expect(state().collateralAllowanceAmount).to.be.undefined
        state().updateCollateralAllowanceAmount!(customAllowanceAmount)
        expect(state().collateralAllowanceAmount).to.deep.equal(customAllowanceAmount)
        state().regress!()
        expect(state().stage).to.deep.equal('otherActions')
        state().progress!()
        state().setCollateralAllowanceAmountUnlimited!()
        expect(state().collateralAllowanceAmount).to.deep.equal(maxUint256)
        // // triggering tx
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceSuccess')
        state().progress!()
        expect(state().stage).to.deep.equal('otherActions')
      })

      it('should handle dai allowance inputs, going back and forth and setting dai allowance', () => {
        const paybackAmount = new BigNumber('5')
        const customAllowanceAmount = new BigNumber(10)
        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
            }),
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            daiAllowance: zero,
          }),
        )

        legacyToggle(state())
        expect(state().stage).to.deep.equal('otherActions')
        state().setOtherAction!('paybackDai')

        state().updatePaybackAmount!(paybackAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
        state().setDaiAllowanceAmountToPaybackAmount!()
        expect(state().daiAllowanceAmount).to.deep.equal(
          paybackAmount.plus(state().vault.debtOffset),
        )
        state().resetDaiAllowanceAmount!()
        expect(state().daiAllowanceAmount).to.be.undefined
        state().updateDaiAllowanceAmount!(customAllowanceAmount)
        expect(state().daiAllowanceAmount).to.deep.equal(customAllowanceAmount)
        state().regress!()
        expect(state().stage).to.deep.equal('otherActions')
        state().progress!()
        state().setDaiAllowanceAmountUnlimited!()
        expect(state().daiAllowanceAmount).to.deep.equal(maxUint256)
        // triggering tx
        state().progress!()
        expect(state().stage).to.deep.equal('daiAllowanceSuccess')
        state().progress!()
        expect(state().stage).to.deep.equal('otherActions')
      })
    })

    describe('multiply to borrow transitions', () => {
      beforeEach(() => localStorage.clear())

      it('should handle previously selected editing stage when going back and forth from borrow transition stages', () => {
        const state = getStateUnpacker(mockManageMultiplyVault$())
        expect(state().stage).to.be.equal('adjustPosition')

        state().toggle!('borrowTransitionEditing')
        expect(state().stage).to.be.equal('borrowTransitionEditing')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionWaitingForConfirmation')
        state().regress!()
        expect(state().stage).to.be.equal('adjustPosition')
        state().toggle!('otherActions')
        expect(state().stage).to.be.equal('otherActions')
        state().toggle!('borrowTransitionEditing')
        expect(state().stage).to.be.equal('borrowTransitionEditing')
        state().regress!()
        expect(state().stage).to.be.equal('otherActions')
      })

      it('should fail when JWT token is not present', () => {
        const state = getStateUnpacker(mockManageMultiplyVault$())

        state().toggle!('borrowTransitionEditing')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionFailure')
      })

      it('should handle multiply transition error', () => {
        localStorage.setItem('token-b/0x123', 'xxx')
        const _saveVaultType$ = new Subject<void>()

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _saveVaultType$,
            account: '0x123',
          }),
        )

        state().toggle!('borrowTransitionEditing')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionInProgress')
        _saveVaultType$.error('error')
        expect(state().stage).to.be.equal('borrowTransitionFailure')
      })

      it('should handle borrow transition success', () => {
        localStorage.setItem('token-b/0x123', 'xxx')
        const _saveVaultType$ = new Subject<void>()

        const state = getStateUnpacker(
          mockManageMultiplyVault$({
            _saveVaultType$,
            account: '0x123',
          }),
        )

        state().toggle!('borrowTransitionEditing')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.be.equal('borrowTransitionInProgress')
        _saveVaultType$.next()
        expect(state().stage).to.be.equal('borrowTransitionSuccess')
      })
    })
  })

  it('should add meaningful message when ledger throws error with disabled contract data', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        _txHelpers$: of({
          ...protoTxHelpers,
          sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
            mockTxState(meta, TxStatus.Error).pipe(
              map((txState) => ({ ...txState, error: { name: 'EthAppPleaseEnableContractData' } })),
            ),
        }),
        vault: {
          collateral: new BigNumber('400'),
          debt: new BigNumber('3000'),
          ilk: 'WBTC-A',
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
      }),
    )

    state().updateRequiredCollRatio!(new BigNumber('2'))
    state().progress!()
    state().progress!()
    expect(state().errorMessages).to.deep.equal(['ledgerWalletContractDataDisabled'])
  })

  it('should add meaningful message when user has insufficient ETH funds to pay for tx', () => {
    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        _txHelpers$: of({
          ...protoTxHelpers,
          sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
            mockTxState(meta, TxStatus.Error).pipe(
              map((txState) => ({
                ...txState,
                error: { message: 'insufficient funds for gas * price + value' },
              })),
            ),
        }),
        vault: {
          collateral: new BigNumber('400'),
          debt: new BigNumber('3000'),
          ilk: 'WBTC-A',
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
        balanceInfo: { ethBalance: new BigNumber(0.001) },
      }),
    )

    state().updateRequiredCollRatio!(new BigNumber('2'))
    state().progress!()
    state().progress!()
    expect(state().errorMessages).to.deep.equal(['insufficientEthFundsForTx'])
  })
})
