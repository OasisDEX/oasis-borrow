/* eslint-disable func-style */

import { TxMeta, TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import {
  mockManageInstiVault$ as createManageInstiVault$,
  mockManageVault$ as createManageVault$,
  mockManageVault$,
} from 'helpers/mocks/manageVault.mock'
import { mockTxState } from 'helpers/mocks/txHelpers.mock'
import {
  DEFAULT_PROXY_ADDRESS,
  defaultCollateral,
  defaultDebt,
  mockVault$,
} from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { BehaviorSubject, of, Subject } from 'rxjs'
import { map } from 'rxjs/internal/operators'

type GlobalMock = NodeJS.Global & { window: { location: { reload: () => void } } }
;(global as GlobalMock).window = {
  location: { reload: () => null },
}

function genericManageVaultTests(mockManageVault$: typeof createManageVault$) {
  describe('editing collateral', () => {
    it('should start by default in an collateral editing stage', () => {
      const state = getStateUnpacker(mockManageVault$())
      expect(state().stage).to.be.equal('collateralEditing')
      expect(state().vault.lockedCollateral).to.deep.equal(defaultCollateral)
      expect(state().vault.debt).to.deep.equal(defaultDebt)

      expect(state().totalSteps).to.deep.equal(4)
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
      expect(state().withdrawAmount).to.be.undefined

      state().setMainAction!('withdrawPayback')
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
      expect(state().withdrawAmount).to.be.undefined

      state().setMainAction!('withdrawPayback')
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

      state().setMainAction!('withdrawPayback')
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
      state().toggle!('daiEditing')
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
      state().toggle!('daiEditing')
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
      state().toggle!('daiEditing')
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

      state().toggle!('daiEditing')
      state().setMainAction!('withdrawPayback')
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
      state().toggle!('daiEditing')
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount!).to.be.undefined
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!).to.be.undefined

      state().setMainAction!('withdrawPayback')
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

      expect(state().totalSteps).to.deep.equal(2)
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
      state().toggle!('daiEditing')
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

      expect(state().totalSteps).to.deep.equal(3)
      state().updateDeposit!(depositAmount)
      state().toggleDepositAndGenerateOption!()
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('collateralAllowanceWaitingForConfirmation')
      expect(state().currentStep).to.deep.equal(2)
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

      state().toggle!('daiEditing')
      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
    })

    it('shold update totalSteps if allowances amount are less than deposit or payback amount', () => {
      const daiAllowance = new BigNumber('1000')
      const collateralAllowance = new BigNumber('1000')

      const paybackAmount = new BigNumber('5000')
      const depositAmount = new BigNumber('5000')
      const withdrawAmount = new BigNumber('5000')

      const state = getStateUnpacker(
        mockManageVault$({
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
      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).to.deep.equal(3)
      state().updateDeposit!(undefined)

      state().setMainAction!('withdrawPayback')
      state().updateWithdraw!(withdrawAmount)
      expect(state().totalSteps).to.deep.equal(2)
      state().togglePaybackAndWithdrawOption!()
      state().updatePayback!(paybackAmount)
      expect(state().totalSteps).to.deep.equal(3)

      state().toggle!('daiEditing')
      expect(state().totalSteps).to.deep.equal(2)
      state().updatePayback!(paybackAmount)
      expect(state().totalSteps).to.deep.equal(3)
    })

    it('shold decrease totalSteps if user skips collateral deposit and has enough dai allowance to payback', () => {
      const daiAllowance = new BigNumber('1000')

      const paybackAmount = new BigNumber('500')
      const depositAmount = new BigNumber('5000')

      const state = getStateUnpacker(
        mockManageVault$({
          vault: {
            collateral: new BigNumber('400'),
            debt: new BigNumber('10000'),
          },
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          daiAllowance,
          collateralAllowance: zero,
        }),
      )

      expect(state().totalSteps).to.deep.equal(3)
      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).to.deep.equal(3)
      state().toggle!('daiEditing')
      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      expect(state().totalSteps).to.deep.equal(2)
    })

    it('should clear form values and go to editing stage', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('1000')

      const state = getStateUnpacker(
        mockManageVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          collateralAllowance: maxUint256,
          vault: {
            ilk: 'WBTC-A',
          },
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('manageWaitingForConfirmation')

      state().clear()
      expect(state().stage).to.deep.equal('collateralEditing')
      expect(state().depositAmount).to.be.undefined
      expect(state().depositAmountUSD).to.be.undefined
      expect(state().generateAmount).to.be.undefined
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
      state().toggle!('daiEditing')
      state().setMainAction!('withdrawPayback')
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

      state().toggle!('daiEditing')
      expect(state().stage).to.deep.equal('daiEditing')
      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      state().progress!()

      expect(state().stage).to.deep.equal('daiAllowanceWaitingForConfirmation')
      state().setDaiAllowanceAmountToPaybackAmount!()
      expect(state().daiAllowanceAmount).to.deep.equal(paybackAmount.plus(state().vault.debtOffset))
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

  describe('multiply transitions', () => {
    beforeEach(() => localStorage.clear())

    it('should handle previously selected editing stage when going back and forth from multiply transition stages', () => {
      const state = getStateUnpacker(mockManageVault$())
      expect(state().stage).to.be.equal('collateralEditing')

      state().toggle!('multiplyTransitionEditing')
      expect(state().stage).to.be.equal('multiplyTransitionEditing')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionWaitingForConfirmation')
      state().regress!()
      expect(state().stage).to.be.equal('collateralEditing')
      state().toggle!('daiEditing')
      expect(state().stage).to.be.equal('daiEditing')
      state().toggle!('multiplyTransitionEditing')
      expect(state().stage).to.be.equal('multiplyTransitionEditing')
      state().regress!()
      expect(state().stage).to.be.equal('daiEditing')
    })

    it('should fail when JWT token is not present', () => {
      const state = getStateUnpacker(mockManageVault$())

      state().toggle!('multiplyTransitionEditing')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionFailure')
    })

    it('should handle multiply transition error', () => {
      localStorage.setItem('token-b/0x123', 'xxx')
      const _saveVaultType$ = new Subject<void>()

      const state = getStateUnpacker(
        mockManageVault$({
          _saveVaultType$,
          account: '0x123',
        }),
      )

      state().toggle!('multiplyTransitionEditing')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionInProgress')
      _saveVaultType$.error('error')
      expect(state().stage).to.be.equal('multiplyTransitionFailure')
    })

    it('should handle multiply transition success', () => {
      localStorage.setItem('token-b/0x123', 'xxx')
      const _saveVaultType$ = new Subject<void>()

      const state = getStateUnpacker(
        mockManageVault$({
          _saveVaultType$,
          account: '0x123',
        }),
      )

      state().toggle!('multiplyTransitionEditing')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.be.equal('multiplyTransitionInProgress')
      _saveVaultType$.next()
      expect(state().stage).to.be.equal('multiplyTransitionSuccess')
    })
  })

  it('should add meaningful message when ledger throws error with disabled contract data', () => {
    const state = getStateUnpacker(
      mockManageVault$({
        _txHelpers$: of({
          ...protoTxHelpers,
          sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
            mockTxState(meta, TxStatus.Error).pipe(
              map((txState) => ({
                ...txState,
                error: { name: 'EthAppPleaseEnableContractData' },
              })),
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

  it('should add meaningful message when user has insufficient ETH funds to pay for tx', () => {
    const state = getStateUnpacker(
      mockManageVault$({
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
        },
        balanceInfo: { ethBalance: new BigNumber(0.001) },
        proxyAddress: DEFAULT_PROXY_ADDRESS,
      }),
    )

    state().progress!()
    state().progress!()

    expect(state().errorMessages).to.deep.equal(['insufficientEthFundsForTx'])
  })
}

describe('manageVault', () => {
  describe('createManageVault$', () => {
    genericManageVaultTests(createManageVault$)
  })

  describe('managing institutional vaults', () => {
    describe('createManageInstiVault$', () => {
      genericManageVaultTests(createManageInstiVault$)
    })

    it('should initialise origination fee USD with zero', () => {
      const { instiVault$ } = mockVault$()

      const state = getStateUnpacker(createManageInstiVault$({ _instiVault$: instiVault$ }))

      expect(state().originationFeeUSD).to.eql(zero)
    })

    it('should contain origination fee in USD in the view state', () => {
      const charterNib$ = new BehaviorSubject<BigNumber>(new BigNumber('0.01'))
      const depositAmount = new BigNumber('5')
      const generateAmount = new BigNumber('3000')
      const secondGenerateAmount = new BigNumber('5000')

      const { instiVault$ } = mockVault$({
        _charterNib$: charterNib$,
      })

      const state = getStateUnpacker(createManageInstiVault$({ _instiVault$: instiVault$ }))

      state().updateDeposit!(depositAmount)
      state().toggleDepositAndGenerateOption!()

      // changes with input value changing
      state().updateGenerate!(generateAmount)
      expect(state().originationFeeUSD!.toString()).to.eq('30')
      state().updateGenerate!(secondGenerateAmount)
      expect(state().originationFeeUSD!.toString()).to.eq('50')

      // changes when we have a new value from the observable
      charterNib$.next(new BigNumber('0.05'))
      expect(state().originationFeeUSD!.toString()).to.eq('250')
    })

    it('blocks user progressing when they will go under min active col ratio at current price', () => {
      // construct over-collateralised vault
      const { instiVault$ } = mockVault$({
        debt: new BigNumber(10000),
        minActiveColRatio: new BigNumber(1.5),
        collateral: new BigNumber(16000),
      })

      const state = getStateUnpacker(
        createManageInstiVault$({
          _instiVault$: instiVault$,
          priceInfo: {
            collateralPrice: new BigNumber('1'),
          },
          ilkData: {
            liquidationRatio: new BigNumber(1.2),
          },
        }),
      )

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).equal(false)
      expect(state().errorMessages.length).equal(0)

      state().updateDeposit!(zero)
      state().toggleDepositAndGenerateOption!()

      // generate enough to take them under min active col ratio at current price
      state().updateGenerate!(new BigNumber(1000))

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).equal(true)

      expect(state().errorMessages.length).equal(2)
      expect(state().errorMessages[0]).equal('generateAmountExceedsDaiYieldFromTotalCollateral')
      expect(state().errorMessages[1]).equal('vaultWillBeTakenUnderMinActiveColRatio')
      expect(state().canProgress).equal(false)
    })

    it('blocks user progressing when they will go under min active col ratio at next price', () => {
      // construct over-collateralised vault
      const { instiVault$ } = mockVault$({
        debt: new BigNumber(10000),
        minActiveColRatio: new BigNumber(1.5),
        collateral: new BigNumber(16000),
      })

      const state = getStateUnpacker(
        createManageInstiVault$({
          _instiVault$: instiVault$,
          priceInfo: {
            collateralPrice: new BigNumber('1'),
            collateralChangePercentage: new BigNumber(-0.1),
          },
          ilkData: {
            liquidationRatio: new BigNumber(1.2),
          },
        }),
      )

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).equal(false)
      expect(state().errorMessages.length).equal(0)

      state().updateDeposit!(zero)
      state().toggleDepositAndGenerateOption!()

      // generate enough to take them under min active col ratio at next price
      state().updateGenerate!(new BigNumber(400))

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).equal(true)
      expect(state().errorMessages.length).equal(2)
      expect(state().errorMessages[0]).equal(
        'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
      )
      expect(state().errorMessages[1]).equal('vaultWillBeTakenUnderMinActiveColRatio')
      expect(state().canProgress).equal(false)
    })

    it('warns users when position is currently undercollateralised', () => {
      // construct under-collateralised vault (min active col ratio)
      const { instiVault$ } = mockVault$({
        debt: new BigNumber(10000),
        minActiveColRatio: new BigNumber(1.5),
        collateral: new BigNumber(14950),
        priceInfo: {
          currentCollateralPrice: new BigNumber('1'),
        },
      })

      const state = getStateUnpacker(
        createManageInstiVault$({
          _instiVault$: instiVault$,
          ilkData: {
            liquidationRatio: new BigNumber(1.2),
          },
        }),
      )

      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).equal(true)
      expect(state().warningMessages.length).equal(1)
      expect(state().warningMessages[0]).equal('vaultIsCurrentlyUnderMinActiveColRatio')
    })

    it('warns users when position will be undercollaterlised at next price', () => {
      // construct over-collateralised vault (min active col ratio)
      const { instiVault$ } = mockVault$({
        debt: new BigNumber(10000),
        minActiveColRatio: new BigNumber(1.5),
        collateral: new BigNumber(16000),
        priceInfo: {
          currentCollateralPrice: new BigNumber('1'),
          nextCollateralPrice: new BigNumber(0.9),
        },
      })

      const state = getStateUnpacker(
        createManageInstiVault$({
          _instiVault$: instiVault$,
          ilkData: {
            liquidationRatio: new BigNumber(1.2),
          },
        }),
      )

      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).equal(true)
      expect(state().warningMessages.length).equal(1)
      expect(state().warningMessages[0]).equal('vaultIsCurrentlyUnderMinActiveColRatio')
    })

    it('allows users to decrease risk on under-collateralised (min active) position', () => {
      // construct under-collateralised vault (min active col ratio)
      const { instiVault$ } = mockVault$({
        debt: new BigNumber(10000),
        minActiveColRatio: new BigNumber('1.6'),
        collateral: new BigNumber(14950),
        priceInfo: {
          currentCollateralPrice: new BigNumber('1'),
          nextCollateralPrice: new BigNumber('1'),
        },
      })

      const state = getStateUnpacker(
        createManageInstiVault$({
          _instiVault$: instiVault$,
          priceInfo: {
            collateralPrice: new BigNumber(1),
            collateralChangePercentage: new BigNumber(0),
          },
          ilkData: {
            liquidationRatio: new BigNumber(1),
          },
        }),
      )

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).equal(false)
      expect(state().vaultWillRemainUnderMinActiveColRatio).equal(false)
      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).equal(true)
      expect(state().errorMessages.length).equal(0)
      expect(state().warningMessages.length).equal(1)
      expect(state().warningMessages).includes('vaultIsCurrentlyUnderMinActiveColRatio')

      state().updateDeposit!(zero)
      state().toggleDepositAndGenerateOption!()

      // deposit more collateral
      state().updateDeposit!(new BigNumber(100))

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).equal(false)
      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).equal(true)
      expect(state().vaultWillRemainUnderMinActiveColRatio).equal(true)

      expect(state().errorMessages.length).equal(0)

      expect(state().warningMessages.length).equal(2)
      expect(state().warningMessages).includes('vaultWillRemainUnderMinActiveColRatio')
      expect(state().warningMessages).includes('vaultIsCurrentlyUnderMinActiveColRatio')
      expect(state().canProgress).equal(true)
    })
  })

  it('ignores current debt when considering dust limit on collateral', () => {
    const state = getStateUnpacker(
      mockManageVault$({
        vault: {
          collateral: new BigNumber('1500'),
          debt: new BigNumber('900'),
        },
        ilkData: {
          debtFloor: new BigNumber('800'),
          liquidationRatio: new BigNumber(1.2),
          currentCollateralPrice: new BigNumber('1'),
        },
        priceInfo: {
          collateralPrice: new BigNumber('1'),
        },
      }),
    )

    state().toggleDepositAndGenerateOption!()
    state().updateDeposit!(new BigNumber('200'))

    expect(state().potentialGenerateAmountLessThanDebtFloor).eq(false)
    expect(state().warningMessages.length).eq(0)
  })

  it('errors when the current collateral would not allow any debt to be drawn from the vault', () => {
    const state = getStateUnpacker(
      mockManageVault$({
        vault: {
          collateral: new BigNumber('1300'),
          debt: new BigNumber('900'),
        },
        ilkData: {
          debtFloor: new BigNumber('1500'),
          liquidationRatio: new BigNumber('1.2'),
          currentCollateralPrice: new BigNumber('1'),
        },
        priceInfo: {
          collateralPrice: new BigNumber('1'),
        },
      }),
    )

    state().toggleDepositAndGenerateOption!()
    state().updateDeposit!(new BigNumber('200'))
    state().updateGenerate!(new BigNumber('700'))

    expect(state().potentialGenerateAmountLessThanDebtFloor).eq(true)
    expect(state().errorMessages.length).eq(1)
    expect(state().errorMessages[0]).eq('depositCollateralOnVaultUnderDebtFloor')
  })

  it('should allow to toggle stage on any point', () => {
    const state = getStateUnpacker(mockManageVault$())

    state().toggle!('collateralEditing')
    expect(state().stage).to.be.equal('collateralEditing')
    state().toggle!('daiEditing')
    expect(state().stage).to.be.equal('daiEditing')
    state().toggle!('multiplyTransitionEditing')
    expect(state().stage).to.be.equal('multiplyTransitionEditing')
  })
})
