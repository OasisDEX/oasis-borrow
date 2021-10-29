/* eslint-disable func-style */

import { TxMeta, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { mockOpenMultiplyVault } from 'helpers/mocks/openMultiplyVault.mock'
import { mockTxState } from 'helpers/mocks/txHelpers.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { parseVaultIdFromReceiptLogs } from '../openMultiplyVaultTransactions'
import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'

describe('open multiply vault', () => {
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

  describe('openMultiplyVault$', () => {
    it('should wait until ilks are fetched before emitting', () => {
      const _ilks$ = new Subject<string[]>()
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          _ilks$,
          ilk: 'WBTC-A',
        }),
      )
      expect(state()).to.be.undefined
      _ilks$.next(['WBTC-A'])
      expect(state().ilk).to.deep.equal('WBTC-A')
      expect(state().totalSteps).to.deep.equal(4)
    })

    it('should throw error if ilk is not valid', () => {
      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          ilks: ['ETH-A'],
          ilk: 'ETH-Z',
        }),
      )
      expect(state).to.throw()
    })

    it('should start by default at the editing stage', () => {
      const state = getStateUnpacker(mockOpenMultiplyVault())
      expect(state().stage).to.deep.equal('editing')
      expect(state().totalSteps).to.deep.equal(4)
    })

    it('should update depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const state = getStateUnpacker(mockOpenMultiplyVault())
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount).to.deep.equal(depositAmount)
    })

    it('should calculate depositAmountUSD based on depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenMultiplyVault({ priceInfo: { collateralPrice } }))
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).to.deep.equal(depositAmount)
      expect(state().depositAmountUSD!).to.deep.equal(depositAmount.times(collateralPrice))
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

      expect(state().depositAmount!).to.deep.equal(collateralBalance)
    })

    it('should update depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const state = getStateUnpacker(mockOpenMultiplyVault())
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmountUSD!).to.deep.equal(depositAmountUSD)
    })

    it('should calculate depositAmount based on depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenMultiplyVault({ priceInfo: { collateralPrice } }))
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount!).to.deep.equal(depositAmountUSD.div(collateralPrice))
      expect(state().depositAmountUSD!).to.deep.equal(depositAmountUSD)
    })

    it('should progress to proxy flow from editing when without proxy', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(mockOpenMultiplyVault())
      state().updateDeposit!(depositAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
    })

    it('should create proxy and progress for non ETH ilk', () => {
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
      expect(state().totalSteps).to.deep.equal(4)
      state().progress!()
      expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().currentStep).to.deep.equal(2)
      expect(state().stage).to.deep.equal('proxySuccess')
      expect(state().proxyAddress).to.deep.equal(DEFAULT_PROXY_ADDRESS)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().currentStep).to.deep.equal(3)
      expect(state().totalSteps).to.deep.equal(4)
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
      expect(state().stage).to.deep.equal('proxyFailure')
      state().regress!()
      expect(state().stage).to.deep.equal('editing')
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
      expect(state().stage).to.not.deep.equal('allowanceWaitingForConfirmation')
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
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
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
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
      expect(state().totalSteps).to.deep.equal(3)

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

    it('should progress to open vault tx flow from editing with proxyAddress and validAllowance', () => {
      const depositAmount = new BigNumber('100')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).to.deep.equal(2)
      state().updateDeposit!(depositAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
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
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('openSuccess')
      expect(state().id!).to.deep.equal(new BigNumber('3281'))
      state().progress!()
      expect(state().stage).to.deep.equal('editing')
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
      expect(state().stage).to.deep.equal('openFailure')
      state().regress!()
      expect(state().stage).to.deep.equal('editing')
    })

    it('shold update totalSteps if allowance amount is less than deposit amount', () => {
      const depositAmount = new BigNumber('100')
      const startingAllowanceAmount = new BigNumber('99')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: startingAllowanceAmount,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).to.deep.equal(2)

      state().updateDeposit!(depositAmount)
      expect(state().totalSteps).to.deep.equal(3)
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

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )

      expect(state().totalSteps).to.deep.equal(2)
      state().updateDeposit!(depositAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
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
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('openSuccess')
      expect(state().id!).to.deep.equal(new BigNumber('3281'))
      state().progress!()
      expect(state().stage).to.deep.equal('editing')
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
      expect(state().stage).to.deep.equal('openFailure')
      state().regress!()
      expect(state().stage).to.deep.equal('editing')
    })

    it('shold update totalSteps if allowance amount is less than deposit amount', () => {
      const depositAmount = new BigNumber('100')
      const startingAllowanceAmount = new BigNumber('99')

      const state = getStateUnpacker(
        mockOpenMultiplyVault({
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
      const requiredCollRatio = new BigNumber('2')

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
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')

      state().clear()
      expect(state().stage).to.deep.equal('editing')
      expect(state().depositAmount).to.be.undefined
      expect(state().depositAmountUSD).to.be.undefined
      expect(state().requiredCollRatio).to.be.undefined
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
      expect(state().errorMessages).to.deep.equal(['ledgerWalletContractDataDisabled'])
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
      expect(state().errorMessages).to.deep.equal(['depositAmountExceedsCollateralBalance'])
      state().updateDeposit!(depositAmountAll)
      expect(state().errorMessages).to.deep.equal(['depositingAllEthBalance'])
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
      expect(state().errorMessages).to.deep.equal(['generateAmountExceedsDebtCeiling'])

      state().updateRequiredCollRatio!(generateAmountBelowFloor)
      expect(state().errorMessages).to.deep.equal(['generateAmountLessThanDebtFloor'])
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
      expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarning'])

      state().updateRequiredCollRatio!(generateAmountCurrentPriceDanger)
      expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelDanger'])

      state().updateRequiredCollRatio!(generateAmountNextPriceWarning)
      expect(state().warningMessages).to.deep.equal(['vaultWillBeAtRiskLevelWarningAtNextPrice'])

      state().updateRequiredCollRatio!(generateAmountNextPriceDanger)
      expect(state().warningMessages).to.deep.equal([
        'vaultWillBeAtRiskLevelDangerAtNextPrice',
        'vaultWillBeAtRiskLevelWarning',
      ])

      state().updateRequiredCollRatio!(generateAmountNextPriceDangerTest)
      expect(state().errorMessages).to.deep.equal([
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

      expect(stateSnap.afterCollateralizationRatio.toPrecision(18)).to.eq('2.00000000000000000')
      expect(stateSnap.buyingCollateral.toPrecision(18)).to.eq('8.97078651685393258')
      expect(stateSnap.afterOutstandingDebt.toPrecision(18)).to.eq('18970.7865168539326')
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

      expect(stateSnap.canAdjustRisk).to.eq(false)
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

      expect(stateSnap.maxCollRatio).to.deep.eq(new BigNumber(5))
    })
  })
})
