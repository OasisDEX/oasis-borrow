/* eslint-disable func-style */

import { TxMeta, TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { mockManageVault$ } from 'helpers/mocks/manageVault.mock'
import { mockTxState } from 'helpers/mocks/txHelpers.mock'
import { DEFAULT_PROXY_ADDRESS, defaultCollateral, defaultDebt } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/internal/operators'

describe('manageVault', () => {
  describe('createManageVault$', () => {
    describe('editing collateral', () => {
      it('should start by default in an collateral editing stage', () => {
        const state = getStateUnpacker(mockManageVault$())
        expect(state().stage).to.be.equal('collateralEditing')
        expect(state().vault.lockedCollateral).to.deep.equal(defaultCollateral)
        expect(state().vault.debt).to.deep.equal(defaultDebt)
      })

      it('should update deposit amount, deposit amount USD and deposit max with collateral balance', () => {
        const depositAmount = new BigNumber('5')
        const depositAmountUSD = new BigNumber('10')
        const collateralBalance = new BigNumber('20')

        const state = getStateUnpacker(
          mockManageVault$({
            balanceInfo: {
              collateralBalance,
            },
          }),
        )

        state().updateDeposit!(depositAmount)
        expect(state().depositAmount!).to.deep.equal(depositAmount)

        state().updateDepositUSD!(depositAmountUSD)
        expect(state().depositAmountUSD!).to.deep.equal(depositAmountUSD)

        state().updateDepositMax!()
        expect(state().depositAmount!).to.deep.equal(collateralBalance)
      })

      it('should update generate amount amount and generate amount max when depositAmount is defined & option is true', () => {
        const depositAmount = new BigNumber('5')
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(mockManageVault$())

        state().updateGenerate!(generateAmount)
        expect(state().generateAmount!).to.be.undefined
        state().updateDeposit!(depositAmount)
        expect(state().depositAmount!).to.deep.equal(depositAmount)
        state().updateGenerate!(generateAmount)
        expect(state().generateAmount!).to.be.undefined
        state().toggleDepositAndGenerateOption!()
        expect(state().showDepositAndGenerateOption).to.be.true
        state().updateGenerate!(generateAmount)
        expect(state().generateAmount!).to.deep.equal(generateAmount)
      })

      it('should update generate max amount when depositAmount is defined & option is true', () => {
        const depositAmount = new BigNumber('5')

        const state = getStateUnpacker(mockManageVault$())

        state().updateGenerateMax!()
        expect(state().generateAmount!).to.be.undefined
        state().updateDeposit!(depositAmount)
        expect(state().depositAmount!).to.deep.equal(depositAmount)
        state().updateGenerateMax!()
        expect(state().generateAmount!).to.be.undefined
        state().toggleDepositAndGenerateOption!()
        expect(state().showDepositAndGenerateOption).to.be.true
        state().updateGenerateMax!()
        expect(state().generateAmount!).to.deep.equal(state().maxGenerateAmount)
      })

      it('should update withdraw amount, withdraw amount USD and withdraw max', () => {
        const withdrawAmount = new BigNumber('5')
        const withdrawAmountUSD = new BigNumber('10')
        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )
        state().updateWithdraw!(withdrawAmount)
        expect(state().withdrawAmount).to.deep.equal(withdrawAmount)

        state().updateWithdrawUSD!(withdrawAmountUSD)
        expect(state().withdrawAmountUSD).to.deep.equal(withdrawAmountUSD)

        state().updateWithdrawMax!()
        expect(state().withdrawAmount).to.deep.equal(state().maxWithdrawAmount)
        expect(state().withdrawAmountUSD).to.deep.equal(state().maxWithdrawAmountUSD)
      })

      it('should update payback amount when withdrawAmount is defined & option is true', () => {
        const withdrawAmount = new BigNumber('5')
        const paybackAmount = new BigNumber('1000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )

        state().updatePayback!(paybackAmount)
        expect(state().paybackAmount!).to.be.undefined
        state().updateWithdraw!(withdrawAmount)
        expect(state().withdrawAmount!).to.deep.equal(withdrawAmount)
        state().updatePayback!(paybackAmount)
        expect(state().paybackAmount!).to.be.undefined
        state().togglePaybackAndWithdrawOption!()
        expect(state().showPaybackAndWithdrawOption).to.be.true
        state().updatePayback!(paybackAmount)
        expect(state().paybackAmount!).to.deep.equal(paybackAmount)
      })

      it('should update payback amount max when withdrawAmount is defined & option is true', () => {
        const withdrawAmount = new BigNumber('5')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )

        state().updatePaybackMax!()
        expect(state().paybackAmount!).to.be.undefined
        state().updateWithdraw!(withdrawAmount)
        expect(state().withdrawAmount!).to.deep.equal(withdrawAmount)
        state().updatePaybackMax!()
        expect(state().paybackAmount!).to.be.undefined
        state().togglePaybackAndWithdrawOption!()
        expect(state().showPaybackAndWithdrawOption).to.be.true
        state().updatePaybackMax!()
        expect(state().paybackAmount!).to.deep.equal(state().maxPaybackAmount)
      })
    })

    describe('editing dai', () => {
      it('should toggle to daiEditing stage', () => {
        const state = getStateUnpacker(mockManageVault$())
        expect(state().stage).to.deep.equal('collateralEditing')
        state().toggle!()
        expect(state().stage).to.deep.equal('daiEditing')
      })

      it('should update generateAmount', () => {
        const generateAmount = new BigNumber('5000')
        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )
        state().toggle!()
        state().updateGenerate!(generateAmount)
        expect(state().generateAmount!).to.deep.equal(generateAmount)
      })

      it('should update depositAmount when generateAmount is defined & option is true', () => {
        const depositAmount = new BigNumber('5')
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )
        state().toggle!()
        state().updateDeposit!(depositAmount)
        expect(state().depositAmount!).to.be.undefined
        state().updateGenerate!(generateAmount)
        expect(state().generateAmount!).to.deep.equal(generateAmount)
        state().updateDeposit!(depositAmount)
        expect(state().depositAmount!).to.be.undefined
        state().toggleDepositAndGenerateOption!()
        expect(state().showDepositAndGenerateOption).to.be.true
        state().updateDeposit!(depositAmount)
        expect(state().depositAmount!).to.deep.equal(depositAmount)
      })

      it('should update paybackAmount', () => {
        const paybackAmount = new BigNumber('2000')
        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )
        state().toggle!()
        state().updatePayback!(paybackAmount)
        expect(state().paybackAmount).to.deep.equal(paybackAmount)
      })

      it('should update withdrawAmount when paybackAmount is defined & option is true', () => {
        const withdrawAmount = new BigNumber('5')
        const paybackAmount = new BigNumber('1000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('50'),
              debt: new BigNumber('5000'),
            },
          }),
        )
        state().toggle!()
        state().updateWithdraw!(withdrawAmount)
        expect(state().withdrawAmount!).to.be.undefined
        state().updatePayback!(paybackAmount)
        expect(state().paybackAmount!).to.deep.equal(paybackAmount)
        state().updateWithdraw!(withdrawAmount)
        expect(state().withdrawAmount!).to.be.undefined
        state().togglePaybackAndWithdrawOption!()
        expect(state().showPaybackAndWithdrawOption).to.be.true
        state().updateWithdraw!(withdrawAmount)
        expect(state().withdrawAmount!).to.deep.equal(withdrawAmount)
      })
    })

    describe('editing progressions', () => {
      it('should progress from collateral editing to manage vault confirmation', () => {
        const depositAmount = new BigNumber('5')
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: maxUint256,
          }),
        )
        state().updateDeposit!(depositAmount)
        state().toggleDepositAndGenerateOption!()
        state().updateGenerate!(generateAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
      })

      it('should progress from dai editing to manage vault confirmation', () => {
        const depositAmount = new BigNumber('5')
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: maxUint256,
          }),
        )
        state().toggle!()
        state().updateGenerate!(generateAmount)
        state().toggleDepositAndGenerateOption!()
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
      })

      it('should progress from editing to proxyWaitingForConfirmation if no proxy exists', () => {
        const depositAmount = new BigNumber('5')
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
          }),
        )
        state().updateDeposit!(depositAmount)
        state().toggleDepositAndGenerateOption!()
        state().updateGenerate!(generateAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
      })

      it('should progress from editing to collateralAllowance flow if user has proxy but insufficent allowance for deposit amount', () => {
        const depositAmount = new BigNumber('5')
        const generateAmount = new BigNumber('3000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('3000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: zero,
          }),
        )
        state().updateDeposit!(depositAmount)
        state().toggleDepositAndGenerateOption!()
        state().updateGenerate!(generateAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')
      })

      it('should progress from editing to daiAllowance flow if user has proxy but insufficent allowance for payback amount', () => {
        const paybackAmount = new BigNumber('5000')

        const state = getStateUnpacker(
          mockManageVault$({
            vault: {
              collateral: new BigNumber('400'),
              debt: new BigNumber('10000'),
            },
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            daiAllowance: zero,
          }),
        )
        state().toggle!()
        state().updatePayback!(paybackAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
      })
    })

    describe('create proxy flow', () => {
      it('should instigate proxy tx correctly', () => {
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForApproval')
      })

      it('should handle in progress case', () => {
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('proxyInProgress')
      })

      it('should handle fail case and back to editing after', () => {
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('proxyFailure')
        state().regress!()
        expect(state().stage).to.deep.equal('collateralEditing')
      })

      it('should handle proxy success case and progress to collateralAllowanceWaitingForConfirmation', () => {
        const _proxyAddress$ = new Subject<string>()
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
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
          mockManageVault$({
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
        state().toggle!()
        state().updatePayback!(paybackAmount)
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
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForApproval')
      })

      it('should handle in progress case', () => {
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageInProgress')
      })

      it('should handle fail case', () => {
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageFailure')
        state().regress!()
        expect(state().stage).to.deep.equal('collateralEditing')
      })

      it('should handle success case', () => {
        const depositAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
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
        state().updateDeposit!(depositAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('manageWaitingForConfirmation')
        state().progress!()
        expect(state().stage).to.deep.equal('manageSuccess')
        state().progress!()
        expect(state().stage).to.deep.equal('collateralEditing')
      })
    })

    describe('manage allowances', () => {
      it('should handle collateral allowance inputs, going back and forth and setting collateral allowance', () => {
        const depositAmount = new BigNumber('5')
        const customAllowanceAmount = new BigNumber(10)
        const generateAmount = new BigNumber('5')
        const state = getStateUnpacker(
          mockManageVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
            }),
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            collateralAllowance: zero,
          }),
        )

        state().updateDeposit!(depositAmount)
        state().updateGenerate!(generateAmount)
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')
        state().setCollateralAllowanceAmountToDepositAmount!()
        expect(state().collateralAllowanceAmount).to.deep.equal(depositAmount)
        state().resetCollateralAllowanceAmount!()
        expect(state().collateralAllowanceAmount).to.be.undefined
        state().updateCollateralAllowanceAmount!(customAllowanceAmount)
        expect(state().collateralAllowanceAmount).to.deep.equal(customAllowanceAmount)

        state().regress!()
        expect(state().stage).to.deep.equal('collateralEditing')
        state().progress!()
        state().setCollateralAllowanceAmountUnlimited!()
        expect(state().collateralAllowanceAmount).to.deep.equal(maxUint256)

        // triggering tx
        state().progress!()
        expect(state().stage).to.deep.equal('collateralAllowanceSuccess')
        state().progress!()
        expect(state().stage).to.deep.equal('collateralEditing')
      })

      it('should handle dai allowance inputs, going back and forth and setting dai allowance', () => {
        const paybackAmount = new BigNumber('5')
        const customAllowanceAmount = new BigNumber(10)

        const state = getStateUnpacker(
          mockManageVault$({
            _txHelpers$: of({
              ...protoTxHelpers,
              sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
            }),
            proxyAddress: DEFAULT_PROXY_ADDRESS,
            daiAllowance: zero,
          }),
        )

        state().toggle!()
        expect(state().stage).to.deep.equal('daiEditing')
        state().updatePayback!(paybackAmount)
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
        expect(state().stage).to.deep.equal('daiEditing')
        state().progress!()
        state().setDaiAllowanceAmountUnlimited!()
        expect(state().daiAllowanceAmount).to.deep.equal(maxUint256)

        // triggering tx
        state().progress!()
        expect(state().stage).to.deep.equal('daiAllowanceSuccess')
        state().progress!()
        expect(state().stage).to.deep.equal('daiEditing')
      })
    })
  })

  it('should add meaningful message when ledger throws error with disabled contract data', () => {
    const state = getStateUnpacker(
      mockManageVault$({
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
        },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
      }),
    )

    state().progress!()
    state().progress!()
    expect(state().errorMessages).to.deep.equal(['ledgerWalletContractDataDisabled'])
  })
})
