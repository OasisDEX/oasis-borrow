/* eslint-disable func-style */

import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockManageVault$ } from 'helpers/mocks/manageVault.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

describe('manageVault', () => {
  describe.only('createManageVault$', () => {
    it('should start in an editing stage', () => {
      const state = getStateUnpacker(mockManageVault$())
      expect(state().stage).to.be.equal('collateralEditing')
      expect(state().vault.lockedCollateral).to.deep.equal(zero)
      expect(state().vault.debt).to.deep.equal(zero)
    })

    it('should update deposit amount in collateral editing stage', () => {
      const depositAmount = new BigNumber('5')
      const state = getStateUnpacker(mockManageVault$())
      state().updateDeposit!(depositAmount)
      expect(state().depositAmount!).to.be.equal(depositAmount)
    })

    it('should update generate amount in collateral editing stage ', () => {
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
      state().updateGenerate!(generateAmount)
      expect(state().generateAmount!).to.deep.equal(generateAmount)
    })

    //   it('collateral-editing.updateDeposit()', () => {
    //     const depositAmount = new BigNumber(5)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateDeposit!(depositAmount)
    //     expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    //     expect(state().stage).to.be.equal('collateralEditing')
    //   })

    //   it('collateral-editing.updateDepositUSD()', () => {
    //     const depositAmount = new BigNumber(5)
    //     const depositAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(depositAmount)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateDepositUSD!(depositAmountUSD)
    //     expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    //     expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
    //   })

    //   it('collateral-editing.updateGenerate()', () => {
    //     const depositAmount = new BigNumber(5)
    //     const generateAmount = new BigNumber(1000)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateGenerate!(generateAmount)
    //     expect(state().generateAmount).to.be.undefined
    //     state().updateDeposit!(depositAmount)
    //     state().updateGenerate!(generateAmount)
    //     expect(state().generateAmount).to.be.undefined
    //     state().toggleDepositAndGenerateOption!()
    //     state().updateGenerate!(generateAmount)
    //     expect(state().generateAmount!.toString()).to.be.equal(generateAmount.toString())
    //   })

    //   it('collateral-editing.updateWithdraw()', () => {
    //     const withdrawAmount = new BigNumber(5)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateWithdraw!(withdrawAmount)
    //     expect(state().withdrawAmount!.toString()).to.be.equal(withdrawAmount.toString())
    //   })

    //   it('collateral-editing.updateWithdrawUSD()', () => {
    //     const withdrawAmount = new BigNumber(5)
    //     const withdrawAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(withdrawAmount)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updateWithdrawUSD!(withdrawAmountUSD)
    //     expect(state().withdrawAmount!.toString()).to.be.equal(withdrawAmount.toString())
    //     expect(state().withdrawAmountUSD!.toString()).to.be.equal(withdrawAmountUSD.toString())
    //   })

    //   it('collateral-editing.updatePayback()', () => {
    //     const withdrawAmount = new BigNumber(5)
    //     const paybackAmount = new BigNumber(1000)
    //     const state = getStateUnpacker(createTestFixture())
    //     state().updatePayback!(paybackAmount)
    //     expect(state().paybackAmount).to.be.undefined
    //     state().updateWithdraw!(withdrawAmount)
    //     state().updatePayback!(paybackAmount)
    //     expect(state().paybackAmount).to.be.undefined
    //     state().togglePaybackAndWithdrawOption!()
    //     state().updatePayback!(paybackAmount)
    //     expect(state().paybackAmount!.toString()).to.be.equal(paybackAmount.toString())
    //   })

    //   it('dai-editing.updateGenerate()', () => {
    //     const generateAmount = new BigNumber(1000)
    //     const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
    //     state().updateGenerate!(generateAmount)
    //     expect(state().generateAmount!.toString()).to.be.equal(generateAmount.toString())
    //   })

    //   it('dai-editing.updateDeposit()', () => {
    //     const generateAmount = new BigNumber(1000)
    //     const depositAmount = new BigNumber(5)
    //     const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
    //     state().updateDeposit!(depositAmount)
    //     expect(state().depositAmount).to.be.undefined
    //     state().updateGenerate!(generateAmount)
    //     state().updateDeposit!(depositAmount)
    //     expect(state().depositAmount).to.be.undefined
    //     state().toggleDepositAndGenerateOption!()
    //     state().updateDeposit!(depositAmount)
    //     expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    //   })

    //   it('dai-editing.updateDepositUSD()', () => {
    //     const generateAmount = new BigNumber(1000)
    //     const depositAmount = new BigNumber(5)
    //     const depositAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(depositAmount)
    //     const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
    //     state().updateDepositUSD!(depositAmountUSD)
    //     expect(state().depositAmount).to.be.undefined
    //     state().updateGenerate!(generateAmount)
    //     state().updateDepositUSD!(depositAmountUSD)
    //     expect(state().depositAmount).to.be.undefined
    //     state().toggleDepositAndGenerateOption!()
    //     state().updateDepositUSD!(depositAmountUSD)
    //     expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
    //     expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
    //   })

    //   it('dai-editing.updatePayback()', () => {
    //     const paybackAmount = new BigNumber(1000)
    //     const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
    //     state().updatePayback!(paybackAmount)
    //     expect(state().paybackAmount!.toString()).to.be.equal(paybackAmount.toString())
    //   })

    //   it('dai-editing.updateWithdraw()', () => {
    //     const paybackAmount = new BigNumber(1000)
    //     const withdrawAmount = new BigNumber(5)
    //     const withdrawAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(withdrawAmount)
    //     const state = getStateUnpacker(createTestFixture({ stage: 'daiEditing' }))
    //     state().updateWithdrawUSD!(withdrawAmountUSD)
    //     expect(state().withdrawAmount).to.be.undefined
    //     state().updatePayback!(paybackAmount)
    //     state().updateWithdrawUSD!(withdrawAmountUSD)
    //     expect(state().withdrawAmount).to.be.undefined
    //     state().togglePaybackAndWithdrawOption!()
    //     state().updateWithdrawUSD!(withdrawAmountUSD)
    //     expect(state().withdrawAmount!.toString()).to.be.equal(withdrawAmount.toString())
    //     expect(state().withdrawAmountUSD!.toString()).to.be.equal(withdrawAmountUSD.toString())
    //   })

    //   it('editing.progress()', () => {
    //     const state = getStateUnpacker(createTestFixture())
    //     state().progress!()
    //     expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
    //   })

    //   it('editing.progress(proxyAddress)', () => {
    //     const state = getStateUnpacker(createTestFixture({ proxyAddress: '0xProxyAddress' }))
    //     state().progress!()
    //     expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    //   })

    //   it('editing.progress(proxyAddress)', () => {
    //     const state = getStateUnpacker(createTestFixture({ proxyAddress: '0xProxyAddress' }))
    //     state().progress!()
    //     expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    //   })

    //   it('manageWaitingForConfirmation.progress()', () => {
    //     const state = getStateUnpacker(
    //       createTestFixture({
    //         proxyAddress: '0xProxyAddress',
    //         txHelpers: {
    //           ...protoTxHelpers,
    //           send: <B extends TxMeta>(_open: any, meta: B) => createMockTxState(meta),
    //         },
    //       }),
    //     )
    //     state().progress!()
    //     expect(state().stage).to.be.equal('manageWaitingForConfirmation')
    //     state().progress!()
    //     expect(state().stage).to.be.equal('manageSuccess')
    //   })
    // })
  })
})
