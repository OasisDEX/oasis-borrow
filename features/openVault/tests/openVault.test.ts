/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockOpenVault$ } from 'helpers/mocks/openVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { Subject } from 'rxjs'

import { parseVaultIdFromReceiptLogs } from '../openVaultTransactions'
import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'

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
    // function createMockTxState<T extends TxMeta>(
    //   meta: T,
    //   status: TxStatus = TxStatus.Success,
    //   receipt: unknown = {},
    // ): Observable<TxState<T>> {
    //   if (status === TxStatus.Success) {
    //     const txState = {
    //       account: '0x',
    //       txNo: 0,
    //       networkId: '1',
    //       meta,
    //       start: new Date(),
    //       lastChange: new Date(),
    //       dismissed: false,
    //       status,
    //       txHash: '0xhash',
    //       blockNumber: 0,
    //       receipt,
    //       confirmations: 15,
    //       safeConfirmations: 15,
    //     }
    //     return of(txState)
    //   } else if (status === TxStatus.Failure) {
    //     const txState = {
    //       account: '0x',
    //       txNo: 0,
    //       networkId: '1',
    //       meta,
    //       start: new Date(),
    //       lastChange: new Date(),
    //       dismissed: false,
    //       status,
    //       txHash: '0xhash',
    //       blockNumber: 0,
    //       receipt,
    //     }
    //     return of(txState)
    //   } else {
    //     throw new Error('Not implemented yet')
    //   }
    // }

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

    //   it('editing.updateDeposit()', () => {
    //     const depositAmount = new BigNumber(5)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateDeposit!(depositAmount)
    //     expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    //     expect(state().stage).to.be.equal('editing')
    //   })

    //   it('editing.updateDepositUSD()', () => {
    //     const depositAmount = new BigNumber(5)
    //     const depositAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(depositAmount)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateDepositUSD!(depositAmountUSD)
    //     expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    //     expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
    //   })

    //   it('editing.updateGenerate()', () => {
    //     const depositAmount = new BigNumber(5)
    //     const generateAmount = new BigNumber(3000)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateDeposit!(depositAmount)
    //     state().updateGenerate!(generateAmount)
    //     expect(state().generateAmount).to.be.undefined
    //     state().toggleGenerateOption!()
    //     state().updateGenerate!(generateAmount)
    //     expect(state().generateAmount!.toString()).to.be.equal(generateAmount.toString())
    //   })

    //   it('editing.progress()', () => {
    //     const state = getStateUnpacker(createTestFixture())
    //     state().progress!()
    //     expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    //   })

    //   it('creating proxy', () => {
    //     const proxyAddress$ = new Subject<string>()
    //     const proxyAddress = '0xProxyAddress'
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         proxyAddress$,
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
    //             createMockTxState(meta),
    //         },
    //       }),
    //     )
    //     proxyAddress$.next()
    //     state().progress!()
    //     expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    //     state().progress!()
    //     proxyAddress$.next(proxyAddress)
    //     expect(state().stage).to.be.equal('proxySuccess')
    //     expect(state().proxyAddress).to.be.equal(proxyAddress)
    //   })

    //   it('creating proxy failure', () => {
    //     const proxyAddress$ = new Subject<string>()
    //     const proxyAddress = '0xProxyAddress'
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         proxyAddress$,
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
    //             createMockTxState(meta, TxStatus.Failure),
    //         },
    //       }),
    //     )
    //     proxyAddress$.next()
    //     state().progress!()
    //     state().progress!()
    //     proxyAddress$.next(proxyAddress)
    //     expect(state().stage).to.be.equal('proxyFailure')
    //   })

    //   it('setting allowance', () => {
    //     const proxyAddress = '0xProxyAddress'
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         ilk: 'WBTC-A',
    //         proxyAddress,
    //         allowance: new BigNumber(99),
    //         depositAmount: new BigNumber(100),
    //         balanceInfo: { collateralBalance: new BigNumber(100) },
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           sendWithGasEstimation: <B extends TxMeta>(_allowance: any, meta: B) =>
    //             createMockTxState(meta),
    //         },
    //       }),
    //     )
    //     state().progress!()
    //     expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
    //     state().progress!()
    //     expect(state().stage).to.be.equal('allowanceSuccess')
    //   })

    //   it('setting allowance failure', () => {
    //     const proxyAddress = '0xProxyAddress'
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         ilk: 'WBTC-A',
    //         proxyAddress,
    //         allowance: new BigNumber(99),
    //         depositAmount: new BigNumber(100),
    //         balanceInfo: { collateralBalance: new BigNumber(100) },
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           sendWithGasEstimation: <B extends TxMeta>(_allowance: any, meta: B) =>
    //             createMockTxState(meta, TxStatus.Failure),
    //         },
    //       }),
    //     )
    //     state().progress!()
    //     state().progress!()
    //     expect(state().stage).to.be.equal('allowanceFailure')
    //   })

    //   it('editing.progress(proxyAddress, allowance)', () => {
    //     const state = getStateUnpacker(createTestFixture({ proxyAddress: '0xProxyAddress' }))
    //     state().progress!()
    //     expect(state().stage).to.be.equal('openWaitingForConfirmation')
    //   })

    //   it('opening vault', () => {
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         proxyAddress: '0xProxyAddress',
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           send: <B extends TxMeta>(_open: any, meta: B) =>
    //             createMockTxState(meta, TxStatus.Success, newCDPTxReceipt),
    //         },
    //       }),
    //     )
    //     state().progress!()
    //     expect(state().stage).to.be.equal('openWaitingForConfirmation')
    //     state().progress!()
    //     expect(state().stage).to.be.equal('openSuccess')
    //     expect(state().id!.toString()).to.be.equal('3281')
    //   })

    //   it('opening vault failure', () => {
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         proxyAddress: '0xProxyAddress',
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           send: <B extends TxMeta>(_open: any, meta: B) =>
    //             createMockTxState(meta, TxStatus.Failure),
    //         },
    //       }),
    //     )
    //     state().progress!()
    //     state().progress!()
    //     expect(state().stage).to.be.equal('openFailure')
    //   })
  })

  // describe('openVault stage categories', () => {
  //   it('should identify editing stage correctly', () => {
  //     const { isEditingStage } = categoriseOpenVaultStage('editing')
  //     expect(isEditingStage).to.be.true
  //   })

  //   it('should identify proxy stages correctly', () => {
  //     expect(categoriseOpenVaultStage('proxyWaitingForConfirmation').isProxyStage).to.be.true
  //     expect(categoriseOpenVaultStage('proxyWaitingForApproval').isProxyStage).to.be.true
  //     expect(categoriseOpenVaultStage('proxyInProgress').isProxyStage).to.be.true
  //     expect(categoriseOpenVaultStage('proxyFailure').isProxyStage).to.be.true
  //     expect(categoriseOpenVaultStage('proxySuccess').isProxyStage).to.be.true
  //   })

  //   it('should identify allowance stages correctly', () => {
  //     expect(categoriseOpenVaultStage('allowanceWaitingForConfirmation').isAllowanceStage).to.be
  //       .true
  //     expect(categoriseOpenVaultStage('allowanceWaitingForApproval').isAllowanceStage).to.be.true
  //     expect(categoriseOpenVaultStage('allowanceInProgress').isAllowanceStage).to.be.true
  //     expect(categoriseOpenVaultStage('allowanceFailure').isAllowanceStage).to.be.true
  //     expect(categoriseOpenVaultStage('allowanceSuccess').isAllowanceStage).to.be.true
  //   })

  //   it('should identify open stages correctly', () => {
  //     expect(categoriseOpenVaultStage('openWaitingForConfirmation').isOpenStage).to.be.true
  //     expect(categoriseOpenVaultStage('openWaitingForApproval').isOpenStage).to.be.true
  //     expect(categoriseOpenVaultStage('openInProgress').isOpenStage).to.be.true
  //     expect(categoriseOpenVaultStage('openFailure').isOpenStage).to.be.true
  //     expect(categoriseOpenVaultStage('openSuccess').isOpenStage).to.be.true
  //   })
  // })
})
