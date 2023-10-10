/* eslint-disable func-style */

import type { TxMeta } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { parseVaultIdFromReceiptLogs } from 'features/shared/transactions'
import { mockOpenMultiplyVault } from 'helpers/mocks/openMultiplyVault.mock'
import { mockTxState } from 'helpers/mocks/txHelpers.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'

// TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
describe.skip('open multiply vault', () => {
  beforeEach(() => {})

  describe('parseVaultIdFromReceiptLogs', () => {
    it('should return vaultId', () => {
      const vaultId = parseVaultIdFromReceiptLogs(newCDPTxReceipt)
      expect(vaultId!).toEqual(new BigNumber('3281'))
    })
    it('should return undefined if NewCdp log is not found', () => {
      const vaultId = parseVaultIdFromReceiptLogs({ logs: [] })
      expect(vaultId).toBeUndefined()
    })
  })

  describe('openMultiplyVault$', () => {
    it('should wait until ilks are fetched before emitting', () => {
      const _ilks$ = new Subject<string[]>()
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          _ilks$,
          ilk: 'WBTC-A',
        }),
      )
      expect(state()).toBeUndefined()
      _ilks$.next(['WBTC-A'])
      expect(state().ilk).toEqual('WBTC-A')
      expect(state().totalSteps).toEqual(3)
    })

    it('should throw error if ilk is not valid', () => {
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilks: ['ETH-A'],
          ilk: 'ETH-Z',
        }),
      )
      expect(state).toThrow('Ilk ETH-Z does not exist')
    })

    it('should start by default at the editing stage', () => {
      const state = getStateUnpacker(mockOpenMultiplyVault())
      expect(state().stage).toEqual('editing')
      expect(state().totalSteps).toEqual(3)
    })

    it('should update depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const state = getStateUnpacker(mockOpenMultiplyVault())
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount).toEqual(depositAmount)
    })

    it('should calculate depositAmountUSD based on depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenMultiplyVault({ priceInfo: { collateralPrice } }))
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).toEqual(depositAmount)
      expect(state().depositAmountUSD!).toEqual(depositAmount.times(collateralPrice))
    })

    it('should deposit the max amount of collateral when updateDepositMax is triggered', () => {
      const collateralBalance = new BigNumber('10')
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          balanceInfo: {
            collateralBalance,
          },
        }),
      )
      state().updateDepositMax!()

      expect(state().depositAmount!).toEqual(collateralBalance)
    })

    it('should update depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const state = getStateUnpacker(mockOpenMultiplyVault())
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmountUSD!).toEqual(depositAmountUSD)
    })

    it('should calculate depositAmount based on depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenMultiplyVault({ priceInfo: { collateralPrice } }))
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount!).toEqual(depositAmountUSD.div(collateralPrice))
      expect(state().depositAmountUSD!).toEqual(depositAmountUSD)
    })

    it('should update stop loss type', () => {
      const closeVaultType = 'collateral'
      const defaultCloseVaultType = 'dai'
      const state = getStateUnpacker(mockOpenMultiplyVault())
      expect(state().stopLossCloseType!).toBe(defaultCloseVaultType)
      state().setStopLossCloseType(closeVaultType)
      expect(state().stopLossCloseType).toBe(closeVaultType)
    })

    it('should update stop loss level', () => {
      const stopLossLevel = new BigNumber(200)
      const defaultStopLossLevel = new BigNumber(160)
      const state = getStateUnpacker(mockOpenMultiplyVault())
      expect(state().stopLossLevel!).toEqual(defaultStopLossLevel)
      state().setStopLossLevel(stopLossLevel)
      expect(state().stopLossLevel).toEqual(stopLossLevel)
    })

    it('should progress to proxy flow from editing when without proxy', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(mockOpenMultiplyVault())
      state().updateDeposit!(depositAmount)

      state().progress!()
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
    })

    it('should create proxy and progress for non ETH ilk', () => {
      const depositAmount = new BigNumber('100')
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          _proxyAddress$,
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
          }),
        }),
      )

      _proxyAddress$.next()
      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).toEqual(5)
      state().progress!()
      expect(state().stage).toEqual('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().currentStep).toEqual(2)
      expect(state().stage).toEqual('proxySuccess')
      expect(state().proxyAddress).toEqual(DEFAULT_PROXY_ADDRESS)
      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
      expect(state().currentStep).toEqual(3)
      expect(state().totalSteps).toEqual(5)
    })

    it('should handle proxy failure and back to editing after', () => {
      const _proxyAddress$ = new Subject<string>()

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      expect(state().stage).toEqual('proxyFailure')
      state().regress!()
      expect(state().stage).toEqual('editing')
    })

    it('should skip allowance flow from editing when allowance is insufficent and ilk is ETH-*', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'ETH-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().progress!()
      expect(state().stage).not.toEqual('allowanceWaitingForConfirmation')
      expect(state().stage).toEqual('stopLossEditing')
    })

    it('should progress to allowance flow from editing when allowance is insufficent and ilk is not ETH-*', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
    })

    it('should handle set allowance to maximum and progress to editing', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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

      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).toEqual(maxUint256)
      state().setAllowanceAmountUnlimited!()
      state().progress!()
      expect(state().stage).toEqual('allowanceSuccess')
      expect(state().allowance!).toEqual(maxUint256)
      state().progress!()
      expect(state().stage).toEqual('editing')
    })

    it('should set allowance to depositAmount', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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

      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).toEqual(maxUint256)
      state().setAllowanceAmountToDepositAmount!()
      expect(state().allowanceAmount!).toEqual(depositAmount)
      state().progress!()
      expect(state().stage).toEqual('allowanceSuccess')
      expect(state().allowance!).toEqual(depositAmount)
    })

    it('should set allowance to custom amount', () => {
      const depositAmount = new BigNumber('100')

      const customAllowanceAmount = new BigNumber('400')
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      expect(state().totalSteps).toEqual(4)

      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
      expect(state().currentStep).toEqual(2)
      expect(state().allowanceAmount!).toEqual(maxUint256)
      state().setAllowanceAmountCustom!()
      expect(state().allowanceAmount).toBeUndefined()
      state().updateAllowanceAmount!(customAllowanceAmount)
      expect(state().allowanceAmount!).toEqual(customAllowanceAmount)
      state().progress!()
      expect(state().stage).toEqual('allowanceSuccess')
      expect(state().allowance!).toEqual(customAllowanceAmount)
      expect(state().totalSteps).toEqual(4)
    })

    it('should progress to open vault tx flow from editing with proxyAddress and validAllowance', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).toEqual(2)
      state().updateDeposit!(depositAmount)
      state().progress!()
      state().skipStopLoss!()
      expect(state().stage).toEqual('txWaitingForConfirmation')
    })

    it('should open vault successfully and progress to editing', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      state().progress!()
      state().skipStopLoss!()
      expect(state().stage).toEqual('txWaitingForConfirmation')
      state().progress!()
      expect(state().id!).toEqual(new BigNumber('3281'))
      expect(state().stage).toEqual('txSuccess')
      state().progress!()
      expect(state().stage).toEqual('editing')
    })

    it('should handle open vault tx failing and back to editing', () => {
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      expect(state().stage).toEqual('txFailure')
      state().regress!()
      expect(state().stage).toEqual('editing')
    })

    it('should update totalSteps if allowance amount is less than deposit amount', () => {
      const depositAmount = new BigNumber('100')
      const startingAllowanceAmount = new BigNumber('99')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: startingAllowanceAmount,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).toEqual(2)

      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).toEqual(4)
    })

    it('should handle set allowance failure and regress allowance', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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

      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).toEqual(maxUint256)
      state().progress!()
      expect(state().stage).toEqual('allowanceFailure')
      expect(state().allowance!).toEqual(zero)
      state().regress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
    })

    it('should clear form values and go to editing stage', () => {
      const depositAmount = new BigNumber('100')
      const requiredCollRatio = new BigNumber('2')
      const stopLossLevel = new BigNumber('1.7')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateRequiredCollRatio!(requiredCollRatio)
      state().progress!()
      expect(state().stage).toEqual('stopLossEditing')
      state().setStopLossLevel(stopLossLevel)
      state().clear()
      expect(state().stage).toEqual('editing')
      expect(state().depositAmount).toBeUndefined()
      expect(state().depositAmountUSD).toBeUndefined()
      expect(state().requiredCollRatio).toBeUndefined()
      expect(state().stopLossLevel).toEqual(zero)
    })
  })

  describe('validation and errors', () => {
    it('should add meaningful message when ledger throws error with disabled contract data', () => {
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      expect(state().errorMessages).toEqual(['ledgerWalletContractDataDisabled'])
    })

    it('should add meaningful message when user has insufficient ETH funds to pay for tx', () => {
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      expect(state().errorMessages).toEqual(['insufficientEthFundsForTx'])
    })

    it('validates if deposit amount exceeds collateral balance or depositing all ETH', () => {
      const depositAmountExceeds = new BigNumber('12')
      const depositAmountAll = new BigNumber('10')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilks: ['ETH-A'],
          ilk: 'ETH-A',
          balanceInfo: {
            collateralBalance: new BigNumber('10'),
          },
        }),
      )

      state().updateDeposit!(depositAmountExceeds)
      expect(state().errorMessages).toEqual(['depositAmountExceedsCollateralBalance'])
      state().updateDeposit!(depositAmountAll)
      expect(state().errorMessages).toEqual(['depositingAllEthBalance'])
    })

    it('validates if deposit amount leads to potential insufficient ETH funds for tx (ETH ilk case)', () => {
      const depositAlmostAll = new BigNumber(10.9999)

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilks: ['ETH-A'],
          ilk: 'ETH-A',
          balanceInfo: {
            ethBalance: new BigNumber(11),
          },
          gasEstimationUsd: new BigNumber(30),
        }),
      )

      state().updateDeposit!(depositAlmostAll)
      expect(state().warningMessages).toEqual(['potentialInsufficientEthFundsForTx'])
    })

    it('validates if deposit amount leads to potential insufficient ETH funds for tx (other ilk case)', () => {
      const depositAmount = new BigNumber(10)

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilk: 'WBTC-A',
          balanceInfo: {
            ethBalance: new BigNumber(0.001),
          },
          gasEstimationUsd: new BigNumber(30),
        }),
      )

      state().updateDeposit!(depositAmount)
      expect(state().warningMessages).toEqual(['potentialInsufficientEthFundsForTx'])
    })

    it(`validates if generate doesn't exceeds debt ceiling and debt floor`, () => {
      const depositAmount = new BigNumber('2')
      const generateAmountAboveCeiling = new BigNumber('2')
      const generateAmountBelowFloor = new BigNumber('5')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilkData: {
            debtCeiling: new BigNumber('8000630'),
            debtFloor: new BigNumber('250'),
          },
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateRequiredCollRatio!(generateAmountAboveCeiling)
      expect(state().errorMessages).toEqual(['generateAmountExceedsDebtCeiling'])

      state().updateRequiredCollRatio!(generateAmountBelowFloor)
      expect(state().errorMessages).toEqual(['generateAmountLessThanDebtFloor'])
    })

    it('validates custom allowance setting', () => {
      const depositAmount = new BigNumber('100')
      const customAllowanceAmount = new BigNumber('99')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)

      state().progress!()
      expect(state().stage).toEqual('allowanceWaitingForConfirmation')
      state().setAllowanceAmountCustom!()
      state().updateAllowanceAmount!(customAllowanceAmount)
      expect(state().allowanceAmount!).toEqual(customAllowanceAmount)
      expect(state().errorMessages).toEqual(['customAllowanceAmountLessThanDepositAmount'])

      state().updateAllowanceAmount!(maxUint256.plus(new BigNumber('1')))
      expect(state().errorMessages).toEqual(['customAllowanceAmountExceedsMaxUint256'])
    })

    it('validates vault risk warnings and exceeding liquidation ratio on next price', () => {
      const depositAmount = new BigNumber('6')
      const generateAmountCurrentPriceDanger = new BigNumber('1.75')
      const generateAmountCurrentPriceWarning = new BigNumber('2.2')

      const generateAmountNextPriceDanger = new BigNumber('1.805')
      const generateAmountNextPriceWarning = new BigNumber('2.26')

      const generateAmountNextPriceDangerTest = new BigNumber('1.505')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilks: ['ETH-A'],
          ilk: 'ETH-A',
          priceInfo: {
            ethChangePercentage: new BigNumber(-0.01),
          },
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateRequiredCollRatio!(generateAmountCurrentPriceWarning)
      expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarning'])

      state().updateRequiredCollRatio!(generateAmountCurrentPriceDanger)
      expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelDanger'])

      state().updateRequiredCollRatio!(generateAmountNextPriceWarning)
      expect(state().warningMessages).toEqual(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

      state().updateRequiredCollRatio!(generateAmountNextPriceDanger)
      expect(state().warningMessages).toEqual([
        'vaultWillBeAtRiskLevelDangerAtNextPrice',
        'vaultWillBeAtRiskLevelWarning',
      ])

      state().updateRequiredCollRatio!(generateAmountNextPriceDangerTest)
      expect(state().errorMessages).toEqual([
        'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice',
      ])
    })
  })

  // https://docs.google.com/spreadsheets/d/11fihiG_2DHiwtfHKXznLQXewP30ckB0umyqgY6Qqyf0/edit#gid=101951580
  describe('openMultiplyVault calculations', () => {
    it('should calculate vault state according spread sheet', () => {
      const multiplyVault$ = mockOpenMultiplyVault({
        priceInfo: {
          collateralPrice: new BigNumber(2000),
        },
        exchangeQuote: {
          marketPrice: new BigNumber(2100),
        },
        ilkData: {
          debtFloor: new BigNumber(5000),
          liquidationRatio: new BigNumber(1.5),
        },
      })
      const state = getStateUnpacker(multiplyVault$)

      state().updateDeposit!(new BigNumber(10))

      state().updateRequiredCollRatio!(new BigNumber(2))

      const stateSnap = state()

      expect(stateSnap.afterCollateralizationRatio.toPrecision(18)).toBe('2.00000000000000000')
      expect(stateSnap.buyingCollateral.toPrecision(18)).toBe('8.97078651685393258')
      expect(stateSnap.afterOutstandingDebt.toPrecision(18)).toBe('18970.7865168539326')
    })

    it('should not allow to update risk when deposited not enough collateral', () => {
      const multiplyVault$ = mockOpenMultiplyVault({
        priceInfo: {
          collateralPrice: new BigNumber(2000),
        },
        exchangeQuote: {
          marketPrice: new BigNumber(2100),
        },
        ilkData: {
          debtFloor: new BigNumber(5000),
          liquidationRatio: new BigNumber(1.5),
        },
      })
      const state = getStateUnpacker(multiplyVault$)

      state().updateDeposit!(new BigNumber(1))

      const stateSnap = state()

      expect(stateSnap.canAdjustRisk).toBe(false)
    })

    it('should allow to set maximum 500% collaterization ratio when depositing enough collateral', () => {
      const multiplyVault$ = mockOpenMultiplyVault({
        priceInfo: {
          collateralPrice: new BigNumber(2000),
        },
        exchangeQuote: {
          marketPrice: new BigNumber(2100),
        },
        ilkData: {
          debtFloor: new BigNumber(5000),
          liquidationRatio: new BigNumber(1.5),
        },
      })
      const state = getStateUnpacker(multiplyVault$)

      state().updateDeposit!(new BigNumber(100))

      const stateSnap = state()

      expect(stateSnap.maxCollRatio).toEqual(new BigNumber(5))
    })

    it('should skip stop loss step', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).toEqual(3)
      state().progress!()
      expect(state().stage).toEqual('stopLossEditing')
      state().skipStopLoss!()
      expect(state().stopLossSkipped).toEqual(true)
      expect(state().stage).toEqual('txWaitingForConfirmation')
    })

    it('should add stop loss successfully', () => {
      const depositAmount = new BigNumber('100')
      const stopLossLevel = new BigNumber('2')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      state().progress!()
      state().setStopLossLevel(stopLossLevel)
      state().progress!()
      expect(state().stage).toEqual('txWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('stopLossTxWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('stopLossTxSuccess')
    })

    it('should handle add stop loss failure', () => {
      const depositAmount = new BigNumber('100')
      const stopLossLevel = new BigNumber('2')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => {
              if (meta.kind === 'multiply') {
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
      state().progress!()
      state().setStopLossLevel(stopLossLevel)
      state().progress!()
      expect(state().stage).toEqual('txWaitingForConfirmation')
      state().progress!()
      expect(state().stage).toEqual('stopLossTxWaitingForConfirmation')
      state().progress!()
      state().stage = 'stopLossTxWaitingForConfirmation'
      state().progress!()
      expect(state().stage).toEqual('stopLossTxFailure')
    })
  })
})
