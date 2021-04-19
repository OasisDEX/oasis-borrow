/* eslint-disable func-style */

import { TxMeta, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { mockOpenVault$ } from 'helpers/mocks/openVault.mock'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { of, Subject } from 'rxjs'

import { parseVaultIdFromReceiptLogs } from '../openVaultTransactions'
import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'
import { mockOpenVaultTxState } from './fixtures/openVaultTx'

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

  describe('openVault$', () => {
    it('should wait until ilks are fetched before emiitting', () => {
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
      expect(state().stage).to.be.equal('editing')
    })

    it('should update depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const state = getStateUnpacker(mockOpenVault$())
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!.toString()).to.deep.equal(depositAmount.toString())
    })

    it('should calculate depositAmountUSD based on depositAmount', () => {
      const depositAmount = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenVault$({ priceInfo: { collateralPrice } }))
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!.toString()).to.deep.equal(depositAmount.toString())
      expect(state().depositAmountUSD!.toString()).to.deep.equal(
        depositAmount.times(collateralPrice).toString(),
      )
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
      expect(state().depositAmount!.toString()).to.deep.equal(depositAmount.toString())
      expect(state().generateAmount!.toString()).to.deep.equal(generateAmount.toString())
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
      expect(state().depositAmount!.toString()).to.deep.equal(collateralBalance.toString())
    })

    it('should update depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const state = getStateUnpacker(mockOpenVault$())
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
    })

    it('should calculate depositAmount based on depositAmountUSD', () => {
      const depositAmountUSD = new BigNumber('5')
      const collateralPrice = new BigNumber('100')
      const state = getStateUnpacker(mockOpenVault$({ priceInfo: { collateralPrice } }))
      state().updateDepositUSD!(depositAmountUSD)
      expect(state().depositAmount!.toString()).to.deep.equal(
        depositAmountUSD.div(collateralPrice).toString(),
      )
      expect(state().depositAmountUSD!.toString()).to.deep.equal(depositAmountUSD.toString())
    })

    it('should progress to proxy flow from editing when without proxy', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(mockOpenVault$())
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    })

    it('should create proxy', () => {
      const _proxyAddress$ = new Subject<string>()
      const state = getStateUnpacker(
        mockOpenVault$({
          _proxyAddress$,
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta),
          }),
        }),
      )

      _proxyAddress$.next()
      state().progress!()
      expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().stage).to.be.equal('proxySuccess')
      expect(state().proxyAddress).to.be.equal(DEFAULT_PROXY_ADDRESS)
    })

    it('should handle proxy failure', () => {
      const _proxyAddress$ = new Subject<string>()

      const state = getStateUnpacker(
        mockOpenVault$({
          _proxyAddress$,
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta, TxStatus.Failure),
          }),
        }),
      )
      _proxyAddress$.next()
      state().progress!()
      state().progress!()
      _proxyAddress$.next(DEFAULT_PROXY_ADDRESS)
      expect(state().stage).to.be.equal('proxyFailure')
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
      expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
    })

    it('should set allowance to maximum', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!.toString()).to.deep.equal(maxUint256.toString())
      state().progress!()
      expect(state().stage).to.be.equal('allowanceSuccess')
      expect(state().allowance!.toString()).to.be.deep.equal(maxUint256.toString())
    })

    it('should set allowance to depositAmount', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!.toString()).to.deep.equal(maxUint256.toString())
      state().setAllowanceAmountToDepositAmount!()
      expect(state().allowanceAmount!.toString()).to.deep.equal(depositAmount.toString())
      state().progress!()
      expect(state().stage).to.be.equal('allowanceSuccess')
      expect(state().allowance!.toString()).to.be.deep.equal(depositAmount.toString())
    })

    it('should set allowance to custom amount', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const customAllowanceAmount = new BigNumber('400')
      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!.toString()).to.deep.equal(maxUint256.toString())
      state().setAllowanceAmountCustom!()
      expect(state().allowanceAmount).to.be.undefined
      state().updateAllowanceAmount!(customAllowanceAmount)
      expect(state().allowanceAmount!.toString()).to.deep.equal(customAllowanceAmount.toString())
      state().progress!()
      expect(state().stage).to.be.equal('allowanceSuccess')
      expect(state().allowance!.toString()).to.be.deep.equal(customAllowanceAmount.toString())
    })

    it('should handle set allowance failure', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta, TxStatus.Failure),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: zero,
          ilk: 'WBTC-A',
        }),
      )

      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)

      state().progress!()
      expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
      expect(state().allowanceAmount!.toString()).to.deep.equal(maxUint256.toString())
      state().progress!()
      expect(state().stage).to.be.equal('allowanceFailure')
      expect(state().allowance!.toString()).to.be.deep.eq(zero.toString())
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
      expect(state().stage).to.be.equal('openWaitingForConfirmation')
    })

    it('should open vault successfully', () => {
      const depositAmount = new BigNumber('100')
      const generateAmount = new BigNumber('20000')

      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            send: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta, TxStatus.Success, newCDPTxReceipt),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )
      state().updateDeposit!(depositAmount)
      state().updateGenerate!(generateAmount)
      state().progress!()
      expect(state().stage).to.be.equal('openWaitingForConfirmation')
      state().progress!()
      expect(state().stage).to.be.equal('openSuccess')
      expect(state().id!.toString()).to.be.equal('3281')
    })

    it('should handle open vault tx failing', () => {
      const state = getStateUnpacker(
        mockOpenVault$({
          _txHelpers$: of({
            ...protoTxHelpers,
            send: <B extends TxMeta>(_proxy: any, meta: B) =>
              mockOpenVaultTxState(meta, TxStatus.Failure),
          }),
          proxyAddress: DEFAULT_PROXY_ADDRESS,
          allowance: maxUint256,
          ilk: 'WBTC-A',
        }),
      )
      state().progress!()
      state().progress!()
      expect(state().stage).to.be.equal('openFailure')
    })
  })
})
