/* eslint-disable func-style */

import type { TxMeta } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
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
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { BehaviorSubject, of, Subject } from 'rxjs'
import { map } from 'rxjs/internal/operators'

type GlobalMock = NodeJS.Global & { window: { location: { reload: () => void } } }
;(global as unknown as GlobalMock).window = {
  location: { reload: () => null },
}

function genericManageVaultTests(mockManageVault$: typeof createManageVault$) {
  describe('editing collateral', () => {
    it('should start by default in an collateral editing stage', () => {
      const state = getStateUnpacker(mockManageVault$())
      expect(state().stage).toBe('collateralEditing')
      expect(state().vault.lockedCollateral).toEqual(defaultCollateral)
      expect(state().vault.debt).toEqual(defaultDebt)

      expect(state().totalSteps).toEqual(4)
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
      expect(state().depositAmount!).toEqual(depositAmount)

      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmountUSD!).toEqual(depositAmountUSD)

      state().updateDepositMax!()
      expect(state().depositAmount!).toEqual(collateralBalance)
    })

    it('should update generate amount amount and generate amount max when depositAmount is defined & option is true', () => {
      const depositAmount = new BigNumber('5')
      const generateAmount = new BigNumber('3000')

      const state = getStateUnpacker(mockManageVault$())

      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!).toBeUndefined()
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).toEqual(depositAmount)
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!).toBeUndefined()
      state().toggleDepositAndGenerateOption!()
      expect(state().showDepositAndGenerateOption).toBe(true)
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!).toEqual(generateAmount)
    })

    it('should update generate max amount when depositAmount is defined & option is true', () => {
      const depositAmount = new BigNumber('5')

      const state = getStateUnpacker(mockManageVault$())

      state().updateGenerateMax!()
      expect(state().generateAmount!).toBeUndefined()
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).toEqual(depositAmount)
      state().updateGenerateMax!()
      expect(state().generateAmount!).toBeUndefined()
      state().toggleDepositAndGenerateOption!()
      expect(state().showDepositAndGenerateOption).toBe(true)
      state().updateGenerateMax!()
      expect(state().generateAmount!).toEqual(state().maxGenerateAmount)
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
      expect(state().withdrawAmount).toBeUndefined()

      state().setMainAction!('withdrawPayback')
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount).toEqual(withdrawAmount)

      state().updateWithdrawUSD!(withdrawAmountUSD)
      expect(state().withdrawAmountUSD).toEqual(withdrawAmountUSD)

      state().updateWithdrawMax!()
      expect(state().withdrawAmount).toEqual(state().maxWithdrawAmount)
      expect(state().withdrawAmountUSD).toEqual(state().maxWithdrawAmountUSD)
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
      expect(state().paybackAmount!).toBeUndefined()
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount).toBeUndefined()

      state().setMainAction!('withdrawPayback')
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount!).toEqual(withdrawAmount)
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!).toBeUndefined()
      state().togglePaybackAndWithdrawOption!()
      expect(state().showPaybackAndWithdrawOption).toBe(true)
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!).toEqual(paybackAmount)
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
      expect(state().paybackAmount!).toBeUndefined()

      state().setMainAction!('withdrawPayback')
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount!).toEqual(withdrawAmount)
      state().updatePaybackMax!()
      expect(state().paybackAmount!).toBeUndefined()
      state().togglePaybackAndWithdrawOption!()
      expect(state().showPaybackAndWithdrawOption).toBe(true)
      state().updatePaybackMax!()
      expect(state().paybackAmount!).toEqual(state().maxPaybackAmount)
    })
  })

  describe('editing dai', () => {
    it('should toggle to daiEditing stage', () => {
      const state = getStateUnpacker(mockManageVault$())
      expect(state().stage).toEqual('collateralEditing')
      state().toggle!('daiEditing')
      expect(state().stage).toEqual('daiEditing')
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
      expect(state().generateAmount!).toEqual(generateAmount)
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
      expect(state().depositAmount!).toBeUndefined()
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!).toEqual(generateAmount)
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).toBeUndefined()
      state().toggleDepositAndGenerateOption!()
      expect(state().showDepositAndGenerateOption).toBe(true)
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).toEqual(depositAmount)
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
      expect(state().paybackAmount).toEqual(paybackAmount)
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
      expect(state().withdrawAmount!).toBeUndefined()
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!).toBeUndefined()

      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      expect(state().paybackAmount!).toEqual(paybackAmount)
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount!).toBeUndefined()
      state().togglePaybackAndWithdrawOption!()
      expect(state().showPaybackAndWithdrawOption).toBe(true)
      state().updateWithdraw!(withdrawAmount)
      expect(state().withdrawAmount!).toEqual(withdrawAmount)
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

      expect(state().totalSteps).toEqual(2)
      state().updateDeposit!(depositAmount)
      state().toggleDepositAndGenerateOption!()
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).toEqual('manageWaitingForConfirmation')
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
      expect(state().stage).toEqual('manageWaitingForConfirmation')
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
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
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

      expect(state().totalSteps).toEqual(3)
      state().updateDeposit!(depositAmount)
      state().toggleDepositAndGenerateOption!()
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).toEqual('collateralAllowanceWaitingForConfirmation')
      expect(state().currentStep).toEqual(2)
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
      expect(state().stage).toEqual('daiAllowanceWaitingForConfirmation')
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

      expect(state().totalSteps).toEqual(2)
      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).toEqual(3)
      state().updateDeposit!(undefined)

      state().setMainAction!('withdrawPayback')
      state().updateWithdraw!(withdrawAmount)
      expect(state().totalSteps).toEqual(2)
      state().togglePaybackAndWithdrawOption!()
      state().updatePayback!(paybackAmount)
      expect(state().totalSteps).toEqual(3)

      state().toggle!('daiEditing')
      expect(state().totalSteps).toEqual(2)
      state().updatePayback!(paybackAmount)
      expect(state().totalSteps).toEqual(3)
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

      expect(state().totalSteps).toEqual(3)
      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).toEqual(3)
      state().toggle!('daiEditing')
      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      expect(state().totalSteps).toEqual(2)
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
      expect(state().stage).toEqual('manageWaitingForConfirmation')

      state().clear()
      expect(state().stage).toEqual('collateralEditing')
      expect(state().depositAmount).toBeUndefined()
      expect(state().depositAmountUSD).toBeUndefined()
      expect(state().generateAmount).toBeUndefined()
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
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('proxyWaitingForApproval')
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
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('proxyInProgress')
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
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('proxyFailure')
      state().regress!()
      expect(state().stage).toEqual('collateralEditing')
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
      expect(state().proxyAddress).toBeUndefined()
      state().updateDeposit!(depositAmount)
      state().progress!()
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().stage).toEqual('proxySuccess')
      expect(state().proxyAddress).toEqual(DEFAULT_PROXY_ADDRESS)
      state().progress!()
      expect(state().stage).toEqual('collateralAllowanceWaitingForConfirmation')
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
      expect(state().proxyAddress).toBeUndefined()
      state().toggle!('daiEditing')
      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      state().progress!()
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().stage).toEqual('proxySuccess')
      expect(state().proxyAddress).toEqual(DEFAULT_PROXY_ADDRESS)
      state().progress!()
      expect(state().stage).toEqual('daiAllowanceWaitingForConfirmation')
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
      expect(state().stage).toEqual('manageWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('manageWaitingForApproval')
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
      expect(state().stage).toEqual('manageWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('manageInProgress')
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
      expect(state().stage).toEqual('manageWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('manageFailure')
      state().regress!()
      expect(state().stage).toEqual('collateralEditing')
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
      expect(state().stage).toEqual('manageWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('manageSuccess')
      state().progress!()
      expect(state().stage).toEqual('collateralEditing')
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
      expect(state().stage).toEqual('collateralAllowanceWaitingForConfirmation')
      state().setCollateralAllowanceAmountToDepositAmount!()
      expect(state().collateralAllowanceAmount).toEqual(depositAmount)
      state().resetCollateralAllowanceAmount!()
      expect(state().collateralAllowanceAmount).toBeUndefined()
      state().updateCollateralAllowanceAmount!(customAllowanceAmount)
      expect(state().collateralAllowanceAmount).toEqual(customAllowanceAmount)

      state().regress!()
      expect(state().stage).toEqual('collateralEditing')
      state().progress!()
      state().setCollateralAllowanceAmountUnlimited!()
      expect(state().collateralAllowanceAmount).toEqual(maxUint256)

      // triggering tx
      state().progress!()
      expect(state().stage).toEqual('collateralAllowanceSuccess')
      state().progress!()
      expect(state().stage).toEqual('collateralEditing')
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
      expect(state().stage).toEqual('daiEditing')
      state().setMainAction!('withdrawPayback')
      state().updatePayback!(paybackAmount)
      state().progress!()

      expect(state().stage).toEqual('daiAllowanceWaitingForConfirmation')
      state().setDaiAllowanceAmountToPaybackAmount!()
      expect(state().daiAllowanceAmount).toEqual(paybackAmount.plus(state().vault.debtOffset))
      state().resetDaiAllowanceAmount!()
      expect(state().daiAllowanceAmount).toBeUndefined()
      state().updateDaiAllowanceAmount!(customAllowanceAmount)
      expect(state().daiAllowanceAmount).toEqual(customAllowanceAmount)

      state().regress!()
      expect(state().stage).toEqual('daiEditing')
      state().progress!()
      state().setDaiAllowanceAmountUnlimited!()
      expect(state().daiAllowanceAmount).toEqual(maxUint256)

      // triggering tx
      state().progress!()
      expect(state().stage).toEqual('daiAllowanceSuccess')
      state().progress!()
      expect(state().stage).toEqual('daiEditing')
    })
  })

  describe('multiply transitions', () => {
    beforeEach(() => localStorage.clear())

    it('should handle previously selected editing stage when going back and forth from multiply transition stages', () => {
      const state = getStateUnpacker(mockManageVault$())
      expect(state().stage).toBe('collateralEditing')

      state().toggle!('multiplyTransitionEditing')
      expect(state().stage).toBe('multiplyTransitionEditing')
      state().progress!()
      expect(state().stage).toBe('multiplyTransitionWaitingForConfirmation')
      state().regress!()
      expect(state().stage).toBe('collateralEditing')
      state().toggle!('daiEditing')
      expect(state().stage).toBe('daiEditing')
      state().toggle!('multiplyTransitionEditing')
      expect(state().stage).toBe('multiplyTransitionEditing')
      state().regress!()
      expect(state().stage).toBe('daiEditing')
    })

    it('should fail when JWT token is not present', () => {
      const state = getStateUnpacker(mockManageVault$())

      state().toggle!('multiplyTransitionEditing')
      state().progress!()
      expect(state().stage).toBe('multiplyTransitionWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toBe('multiplyTransitionFailure')
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
      expect(state().stage).toBe('multiplyTransitionWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toBe('multiplyTransitionInProgress')
      _saveVaultType$.error('error')
      expect(state().stage).toBe('multiplyTransitionFailure')
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
      expect(state().stage).toBe('multiplyTransitionWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toBe('multiplyTransitionInProgress')
      _saveVaultType$.next()
      expect(state().stage).toBe('multiplyTransitionSuccess')
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
    expect(state().errorMessages).toEqual(['ledgerWalletContractDataDisabled'])
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

    expect(state().errorMessages).toEqual(['insufficientEthFundsForTx'])
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

      expect(state().originationFeeUSD).toEqual(zero)
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
      expect(state().originationFeeUSD!.toString()).toBe('30')
      state().updateGenerate!(secondGenerateAmount)
      expect(state().originationFeeUSD!.toString()).toBe('50')

      // changes when we have a new value from the observable
      charterNib$.next(new BigNumber('0.05'))
      expect(state().originationFeeUSD!.toString()).toBe('250')
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

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).toBe(false)
      expect(state().errorMessages.length).toBe(0)

      state().updateDeposit!(zero)
      state().toggleDepositAndGenerateOption!()

      // generate enough to take them under min active col ratio at current price
      state().updateGenerate!(new BigNumber(1000))

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).toBe(true)

      expect(state().errorMessages.length).toBe(2)
      expect(state().errorMessages[0]).toBe('generateAmountExceedsDaiYieldFromTotalCollateral')
      expect(state().errorMessages[1]).toBe('vaultWillBeTakenUnderMinActiveColRatio')
      expect(state().canProgress).toBe(false)
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

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).toBe(false)
      expect(state().errorMessages.length).toBe(0)

      state().updateDeposit!(zero)
      state().toggleDepositAndGenerateOption!()

      // generate enough to take them under min active col ratio at next price
      state().updateGenerate!(new BigNumber(400))

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).toBe(true)
      expect(state().errorMessages.length).toBe(2)
      expect(state().errorMessages[0]).toBe(
        'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
      )
      expect(state().errorMessages[1]).toBe('vaultWillBeTakenUnderMinActiveColRatio')
      expect(state().canProgress).toBe(false)
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

      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).toBe(true)
      expect(state().warningMessages.length).toBe(1)
      expect(state().warningMessages[0]).toBe('vaultIsCurrentlyUnderMinActiveColRatio')
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

      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).toBe(true)
      expect(state().warningMessages.length).toBe(1)
      expect(state().warningMessages[0]).toBe('vaultIsCurrentlyUnderMinActiveColRatio')
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

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).toBe(false)
      expect(state().vaultWillRemainUnderMinActiveColRatio).toBe(false)
      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).toBe(true)
      expect(state().errorMessages.length).toBe(0)
      expect(state().warningMessages.length).toBe(1)
      expect(state().warningMessages).toEqual(
        expect.arrayContaining(['vaultIsCurrentlyUnderMinActiveColRatio']),
      )

      state().updateDeposit!(zero)
      state().toggleDepositAndGenerateOption!()

      // deposit more collateral
      state().updateDeposit!(new BigNumber(100))

      expect(state().vaultWillBeTakenUnderMinActiveColRatio).toBe(false)
      expect(state().vaultIsCurrentlyUnderMinActiveColRatio).toBe(true)
      expect(state().vaultWillRemainUnderMinActiveColRatio).toBe(true)

      expect(state().errorMessages.length).toBe(0)

      expect(state().warningMessages.length).toBe(2)
      expect(state().warningMessages).toEqual(
        expect.arrayContaining(['vaultWillRemainUnderMinActiveColRatio']),
      )
      expect(state().warningMessages).toEqual(
        expect.arrayContaining(['vaultIsCurrentlyUnderMinActiveColRatio']),
      )
      expect(state().canProgress).toBe(true)
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

    expect(state().potentialGenerateAmountLessThanDebtFloor).toBe(false)
    expect(state().warningMessages.length).toBe(0)
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

    expect(state().potentialGenerateAmountLessThanDebtFloor).toBe(true)
    expect(state().errorMessages.length).toBe(1)
    expect(state().errorMessages[0]).toBe('depositCollateralOnVaultUnderDebtFloor')
  })

  it('should allow to toggle stage on any point', () => {
    const state = getStateUnpacker(mockManageVault$())

    state().toggle!('collateralEditing')
    expect(state().stage).toBe('collateralEditing')
    state().toggle!('daiEditing')
    expect(state().stage).toBe('daiEditing')
    state().toggle!('multiplyTransitionEditing')
    expect(state().stage).toBe('multiplyTransitionEditing')
  })
})
