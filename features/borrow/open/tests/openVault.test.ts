/* eslint-disable func-style */

import { TxMeta, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { mockOpenVault$ } from 'helpers/mocks/openVault.mock'
import { mockTxState } from 'helpers/mocks/txHelpers.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { parseVaultIdFromReceiptLogs } from '../../../shared/transactions'
import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'

describe('openVault', () => {
  beforeEach(() => {})

  describe('parseVaultIdFromReceiptLogs', () => {
    it('should return vaultId', () => {
      const vaultId = parseVaultIdFromReceiptLogs(newCDPTxReceipt)
      expect(vaultId!).to.deep.equal(new BigNumber('3281'))
    })
    it('should return undefined if NewCdp log is not found', () => {
      const vaultId = parseVaultIdFromReceiptLogs({ logs: [] })
      expect(vaultId).to.deep.equal(undefined)
    })
  })

  describe('openVault$', () => {
    it('should wait until ilks are fetched before emitting', () => {
      const _ilks$ = new Subject<string[]>()
      const state = getStateUnpacker(
        mockOpenVault$({
          _ilks$,
          ilk: 'WBTC-A',
        }),
      )
      expect(state()).to.be.undefined
      _ilks$.next(['WBTC-A'])
      expect(state().ilk).to.deep.equal('WBTC-A')
      expect(state().totalSteps).to.deep.equal(3)
    })

    it('should throw error if ilk is not valid', () => {
      const state = getStateUnpacker(
        mockOpenVault$({
          ilks: ['ETH-A'],
          ilk: 'ETH-Z',
        }),
      )
      expect(state).to.throw(`Ilk ETH-Z does not exist`)
    })

    it('should start by default at the editing stage', () => {
      const state = getStateUnpacker(mockOpenVault$())
      expect(state().stage).to.deep.equal('editing')
      expect(state().totalSteps).to.deep.equal(3)
    })

    it('should update depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const state = getStateUnpacker(mockOpenVault$())
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount).to.deep.equal(depositAmount)
    })

    it('should calculate depositAmountUSD based on depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenVault$({ priceInfo: { collateralPrice } }))
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).to.deep.equal(depositAmount)
      expect(state().depositAmountUSD!).to.deep.equal(depositAmount.times(collateralPrice))
    })

    it('should update generate amount only when a depositAmount is specified and the showGenerateOption is toggled', () => {
      const depositAmount = new BigNumber('5')
      const generateAmount = new BigNumber('2000')
      const state = getStateUnpacker(mockOpenVault$())
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount).to.be.undefined
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount).to.be.undefined
      state().toggleGenerateOption!()
      state().updateGenerate!(generateAmount)
      expect(state().depositAmount!).to.deep.equal(depositAmount)
      expect(state().generateAmount!).to.deep.equal(generateAmount)
    })

    it('should update generate max only when a depositAmount is specified and the showGenerateOption is toggled', () => {
      const depositAmount = new BigNumber('5')

      const state = getStateUnpacker(mockOpenVault$())

      state().updateGenerateMax!()
      expect(state().generateAmount).to.be.undefined
      state().updateDeposit!(depositAmount)
      state().updateGenerateMax!()
      expect(state().generateAmount).to.be.undefined
      state().toggleGenerateOption!()
      state().updateGenerateMax!()
      expect(state().depositAmount!).to.deep.equal(depositAmount)
      expect(state().generateAmount!).to.deep.equal(state().maxGenerateAmount)
    })

    it('should deposit the max amount of collateral when updateDepositMax is triggered', () => {
      const collateralBalance = new BigNumber('10')
      const state = getStateUnpacker(
        mockOpenVault$({
          balanceInfo: {
            collateralBalance,
          },
        }),
      )
      state().updateDepositMax!()
      expect(state().depositAmount!).to.deep.equal(collateralBalance)
    })

    it('should update depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const state = getStateUnpacker(mockOpenVault$())
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmountUSD!).to.deep.equal(depositAmountUSD)
    })

    it('should calculate depositAmount based on depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenVault$({ priceInfo: { collateralPrice } }))
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount!).to.deep.equal(depositAmountUSD.div(collateralPrice))
      expect(state().depositAmountUSD!).to.deep.equal(depositAmountUSD)
    })

    it('should update stop loss type', () => {
      const closeVaultType = 'collateral'
      const defaultCloseVaultType = 'dai'
      const state = getStateUnpacker(mockOpenVault$())
      expect(state().stopLossCloseType!).to.equal(defaultCloseVaultType)
      state().setStopLossCloseType(closeVaultType)
      expect(state().stopLossCloseType).to.equal(closeVaultType)
    })

    it('should update stop loss level', () => {
      const stopLossLevel = new BigNumber(2)
      const defaultStopLossLevel = zero
      const state = getStateUnpacker(mockOpenVault$())
      expect(state().stopLossLevel!).to.deep.equal(defaultStopLossLevel)
      state().setStopLossLevel(stopLossLevel)
      expect(state().stopLossLevel).to.deep.equal(stopLossLevel)
    })

    it('should progress to proxy flow from editing when without proxy', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(mockOpenVault$())
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
    })

    it('should create proxy and progress for non ETH ilk', () => {
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenVault$({
          _proxyAddress$,
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
          }),
        }),
      )

      _proxyAddress$.next()
      expect(state().totalSteps).to.deep.equal(3)
      state().progress!()
      expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().currentStep).to.deep.equal(2)
      expect(state().stage).to.deep.equal('proxySuccess')
      expect(state().proxyAddress).to.deep.equal(DEFAULT_PROXY_ADDRESS)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().currentStep).to.deep.equal(2)
      expect(state().totalSteps).to.deep.equal(3)
    })

    it('should handle proxy failure and back to editing after', () => {
      const _proxyAddress$ = new Subject<string>()

      const state = getStateUnpacker(
        mockOpenVault$({
          _proxyAddress$,
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockTxState(meta, TxStatus.Failure),
          }),
        }),
      )
      _proxyAddress$.next()
      state().progress!()
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().stage).to.deep.equal('proxyFailure')
      state().regress!()
      expect(state().stage).to.deep.equal('editing')
    })

    it('should skip allowance flow from editing when allowance is insufficent and ilk is ETH-*', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'ETH-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.not.deep.equal('allowanceWaitingForConfirmation')
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')
    })

    it('should progress to allowance flow from editing when allowance is insufficent and ilk is not ETH-*', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
    })

    it('should handle set allowance to maximum and progress to editing', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).to.deep.equal(maxUint256)
      state().setAllowanceAmountUnlimited!()
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceSuccess')
      expect(state().allowance!).to.be.deep.equal(maxUint256)
      state().progress!()
      expect(state().stage).to.deep.equal('editing')
    })

    it('should set allowance to depositAmount', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).to.deep.equal(maxUint256)
      state().setAllowanceAmountToDepositAmount!()
      expect(state().allowanceAmount!).to.deep.equal(depositAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceSuccess')
      expect(state().allowance!).to.be.deep.equal(depositAmount)
    })

    it('should set allowance to custom amount', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const customAllowanceAmount = new BigNumber('400')
      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).to.deep.equal(3)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().currentStep).to.deep.equal(2)
      expect(state().allowanceAmount!).to.deep.equal(maxUint256)
      state().setAllowanceAmountCustom!()
      expect(state().allowanceAmount).to.be.undefined
      state().updateAllowanceAmount!(customAllowanceAmount)
      expect(state().allowanceAmount!).to.deep.equal(customAllowanceAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceSuccess')
      expect(state().allowance!).to.be.deep.equal(customAllowanceAmount)
      expect(state().totalSteps).to.deep.equal(3)
    })

    it('should handle set allowance failure and regress allowance', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockTxState(meta, TxStatus.Failure),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).to.deep.equal(maxUint256)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceFailure')
      expect(state().allowance!).to.be.deep.eq(zero)
      state().regress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
    })

    it('should progress to open vault tx flow from editing with proxyAddress and validAllowance', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).to.deep.equal(2)
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')
    })

    it('should skip stop loss step', () => {
      localStorage.setItem('features', '{"StopLossWrite":true}')
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().toggleGenerateOption!()
      state().updateGenerate!(generateAmount)
      expect(state().totalSteps).to.deep.equal(3)
      state().progress!()
      expect(state().stage).to.deep.equal('stopLossEditing')
      state().skipStopLoss!()
      expect(state().stopLossSkipped).to.deep.equal(true)
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')
    })

    it('should add stop loss successfully', () => {
      localStorage.setItem('features', '{"StopLossWrite":true}')
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')
      const stopLossLevel = new BigNumber('2')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockTxState(meta, TxStatus.Success, newCDPTxReceipt),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().toggleGenerateOption!()
      state().updateGenerate!(generateAmount)
      state().progress!()
      state().setStopLossLevel(stopLossLevel)
      state().progress!()
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('stopLossTxWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('stopLossTxSuccess')
    })

    it('should handle add stop loss failure', () => {
      localStorage.setItem('features', '{"StopLossWrite":true}')
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')
      const stopLossLevel = new BigNumber('2')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => {
              if (meta.kind === 'open') {
                return mockTxState(meta, TxStatus.Success, newCDPTxReceipt)
              }
              return mockTxState(meta, TxStatus.Failure)
            },
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().toggleGenerateOption!()
      state().updateGenerate!(generateAmount)
      state().progress!()
      state().setStopLossLevel(stopLossLevel)
      state().progress!()
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('stopLossTxWaitingForConfirmation')
      state().progress!()
      state().stage = 'stopLossTxWaitingForConfirmation'
      state().progress!()
      expect(state().stage).to.deep.equal('stopLossTxFailure')
    })

    it('should open vault successfully and progress to editing', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockTxState(meta, TxStatus.Success, newCDPTxReceipt),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('txSuccess')
      expect(state().id!).to.deep.equal(new BigNumber('3281'))
      state().progress!()
      expect(state().stage).to.deep.equal('editing')
    })

    it('should handle open vault tx failing and back to editing', () => {
      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockTxState(meta, TxStatus.Failure),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )
      state().progress!()
      state().progress!()
      expect(state().stage).to.deep.equal('txFailure')
      state().regress!()
      expect(state().stage).to.deep.equal('editing')
    })

    it('shold update totalSteps if allowance amount is less than deposit amount', () => {
      const depositAmount = new BigNumber('100')
      const startingAllowanceAmount = new BigNumber('99')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: startingAllowanceAmount,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).to.deep.equal(2)

      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).to.deep.equal(3)
    })

    it('should clear form values and go to editing stage', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('txWaitingForConfirmation')

      state().clear()
      expect(state().stage).to.deep.equal('editing')
      expect(state().depositAmount).to.be.undefined
      expect(state().depositAmountUSD).to.be.undefined
    })
  })

  describe('validation and errors', () => {
    it('should add meaningful message when ledger throws error with disabled contract data', () => {
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenVault$({
          _proxyAddress$,
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
        }),
      )

      _proxyAddress$.next()
      state().progress!()
      state().progress!()
      expect(state().errorMessages).to.deep.equal(['ledgerWalletContractDataDisabled'])
    })

    it('should add meaningful message when user has insufficient ETH funds to pay for tx', () => {
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenVault$({
          _proxyAddress$,
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
          balanceInfo: { ethBalance: new BigNumber(0.001) },
        }),
      )
      _proxyAddress$.next()
      state().progress!()
      state().progress!()

      expect(state().errorMessages).to.deep.equal(['insufficientEthFundsForTx'])
    })

    it('validates if deposit amount exceeds collateral balance or depositing all ETH', () => {
      const depositAmountExceeds = new BigNumber('2')
      const depositAmountAll = new BigNumber('1')

      const state = getStateUnpacker(
        mockOpenVault$({
          ilks: ['ETH-A'],
          ilk: 'ETH-A',
          balanceInfo: {
            collateralBalance: new BigNumber('1'),
          },
        }),
      )

      state().updateDeposit!(depositAmountExceeds)
      expect(state().errorMessages).to.deep.equal(['depositAmountExceedsCollateralBalance'])
      state().updateDeposit!(depositAmountAll)
      expect(state().errorMessages).to.deep.equal(['depositingAllEthBalance'])
    })

    it('validates if deposit amount leads to potential insufficient ETH funds for tx (ETH ilk case)', () => {
      const depositAlmostAll = new BigNumber(10.9999)

      const state = getStateUnpacker(
        mockOpenVault$({
          ilks: ['ETH-A'],
          ilk: 'ETH-A',
          balanceInfo: {
            ethBalance: new BigNumber(11),
          },
          gasEstimationUsd: new BigNumber(30),
        }),
      )

      state().updateDeposit!(depositAlmostAll)
      expect(state().warningMessages).to.deep.equal(['potentialInsufficientEthFundsForTx'])
    })

    it('validates if deposit amount leads to potential insufficient ETH funds for tx (other ilk case)', () => {
      const depositAmount = new BigNumber('10')

      const state = getStateUnpacker(
        mockOpenVault$({
          ilk: 'WBTC-A',
          balanceInfo: {
            ethBalance: new BigNumber(0.001),
          },
          gasEstimationUsd: new BigNumber(30),
        }),
      )

      state().updateDeposit!(depositAmount)
      expect(state().warningMessages).to.deep.equal(['potentialInsufficientEthFundsForTx'])
    })

    it(`validates if generate doesn't exceeds debt ceiling and debt floor`, () => {
      const depositAmount = new BigNumber('2')
      const generateAmountAboveCeiling = new BigNumber('30')
      const generateAmountBelowFloor = new BigNumber('9')

      const state = getStateUnpacker(
        mockOpenVault$({
          ilkData: {
            debtCeiling: new BigNumber('8000025'),
            debtFloor: new BigNumber('10'),
          },
        }),
      )

      state().updateDeposit!(depositAmount)
      state().toggleGenerateOption!()
      state().updateGenerate!(generateAmountAboveCeiling)
      expect(state().errorMessages).to.deep.equal(['generateAmountExceedsDebtCeiling'])

      state().updateGenerate!(generateAmountBelowFloor)
      expect(state().errorMessages).to.deep.equal(['generateAmountLessThanDebtFloor'])
    })

    it('validates custom allowance setting', () => {
      const depositAmount = new BigNumber('100')
      const customAllowanceAmount = new BigNumber('99')

      const state = getStateUnpacker(
        mockOpenVault$({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      state().setAllowanceAmountCustom!()
      state().updateAllowanceAmount!(customAllowanceAmount)
      expect(state().allowanceAmount!).to.deep.equal(customAllowanceAmount)
      expect(state().errorMessages).to.deep.equal(['customAllowanceAmountLessThanDepositAmount'])

      state().updateAllowanceAmount!(maxUint256.plus(new BigNumber('1')))
      expect(state().errorMessages).to.deep.equal(['customAllowanceAmountExceedsMaxUint256'])
    })

    it('validates vault risk warnings and exceeding liquidation ratio on next price', () => {
      const depositAmount = new BigNumber('6')
      const generateAmountCurrentPriceDanger = new BigNumber('4700')
      const generateAmountCurrentPriceWarning = new BigNumber('4300')

      const generateAmountNextPriceDanger = new BigNumber('4470')
      const generateAmountNextPriceWarning = new BigNumber('3570')

      const generateAmountNextPriceDangerTest = new BigNumber('5370')

      const state = getStateUnpacker(
        mockOpenVault$({
          ilks: ['ETH-A'],
          ilk: 'ETH-A',
          priceInfo: {
            ethChangePercentage: new BigNumber(-0.01),
          },
        }),
      )

      state().updateDeposit!(depositAmount)
      state().toggleGenerateOption!()
      state().updateGenerate!(generateAmountCurrentPriceWarning)
      expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarning'])

      state().updateGenerate!(generateAmountCurrentPriceDanger)
      expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelDanger'])

      state().updateGenerate!(generateAmountNextPriceWarning)
      expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

      state().updateGenerate!(generateAmountNextPriceDanger)
      expect(state().warningMessages).to.deep.equal([
        'vaultWillBeAtRiskLevelDangerAtNextPrice',
        'vaultWillBeAtRiskLevelWarning',
      ])

      state().updateGenerate!(generateAmountNextPriceDangerTest)
      expect(state().errorMessages).to.deep.equal([
        'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice',
      ])
    })
  })
})
