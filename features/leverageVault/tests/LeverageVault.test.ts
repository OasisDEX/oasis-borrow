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

import { parseVaultIdFromReceiptLogs } from '../leverageVaultTransactions'
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
    })

    it('should throw error if ilk is not valid', () => {
      const state = getStateUnpacker(
        mockOpenVault$({
          ilks: ['ETH-A'],
          ilk: 'ETH-Z',
        }),
      )
      expect(state).to.throw()
    })

    it('should start by default at the editing stage', () => {
      const state = getStateUnpacker(mockOpenVault$())
      expect(state().stage).to.deep.equal('editing')
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

    it('should progress to proxy flow from editing when without proxy', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(mockOpenVault$())
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
    })

    it('should create proxy', () => {
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
      state().progress!()
      expect(state().stage).to.deep.equal('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().stage).to.deep.equal('proxySuccess')
      expect(state().proxyAddress).to.deep.equal(DEFAULT_PROXY_ADDRESS)
    })

    it('should handle proxy failure', () => {
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
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
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

    it('should set allowance to maximum', () => {
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
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceSuccess')
      expect(state().allowance!).to.be.deep.equal(maxUint256)
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
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.deep.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!).to.deep.equal(maxUint256)
      state().setAllowanceAmountCustom!()
      expect(state().allowanceAmount).to.be.undefined
      state().updateAllowanceAmount!(customAllowanceAmount)
      expect(state().allowanceAmount!).to.deep.equal(customAllowanceAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('allowanceSuccess')
      expect(state().allowance!).to.be.deep.equal(customAllowanceAmount)
    })

    it('should handle set allowance failure', () => {
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
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
    })

    it('should open vault successfully', () => {
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
      expect(state().stage).to.deep.equal('openWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.deep.equal('openSuccess')
      expect(state().id!).to.deep.equal(new BigNumber('3281'))
    })

    it('should handle open vault tx failing', () => {
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
      expect(state().stage).to.deep.equal('openFailure')
    })
  })

  it('should add meaningful message when ledger throws error with disabled contract data', () => {
    const _proxyAddress$ = new Subject<string>()
    const state = getStateUnpacker(
      mockOpenVault$({
        _proxyAddress$,
        _txHelpers$: of({
          ...protoTxHelpers,
          sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
            mockTxState(meta, TxStatus.Error).pipe(
              map((txState) => ({ ...txState, error: { name: 'EthAppPleaseEnableContractData' } })),
            ),
        }),
      }),
    )

    _proxyAddress$.next()
    state().progress!()
    state().progress!()
    expect(state().errorMessages).to.deep.equal(['ledgerWalletContractDataDisabled'])
  })
})
