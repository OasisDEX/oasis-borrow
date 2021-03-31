import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { protoUserWBTCTokenInfo } from 'features/shared/priceInfo'
import { zero } from 'helpers/zero'
import { beforeEach, describe, it } from 'mocha'

import { newCDPTxReceipt } from './fixtures/newCDPtxReceipt'
import { defaultOpenVaultState, parseVaultIdFromReceiptLogs, validateWarnings } from './openVault'

const SLIGHTLY_LESS_THAN_ONE = 0.99
const SLIGHTLY_MORE_THAN_ONE = 1.01

describe('openVault', () => {
  beforeEach(() => {})

  describe('parseVaultIdFromReceiptLogs', () => {
    it('should return vaultId', () => {
      const vaultId = parseVaultIdFromReceiptLogs(newCDPTxReceipt)
      expect(vaultId).to.equal(3281)
    })
    it('should return undefined if NewCdp log is not found', () => {
      const vaultId = parseVaultIdFromReceiptLogs({ logs: [] })
      expect(vaultId).to.equal(undefined)
    })
  })

  describe('validateWarnings', () => {
    const depositAmount = new BigNumber('10')
    const openVaultState = {
      ...defaultOpenVaultState,
      ...protoUserWBTCTokenInfo,
      token: 'WBTC',
      proxyAddress: '0xProxyAddress',
      depositAmount,
      depositAmountUSD: depositAmount.multipliedBy(protoUserWBTCTokenInfo.currentCollateralPrice),
      generateAmount: new BigNumber('5000'),
      allowance: depositAmount,
    }
    it('Should show no warnings when the state is correct', () => {
      const { warningMessages } = validateWarnings(openVaultState)
      expect(warningMessages).to.be.an('array').that.is.empty
    })
    it('Should show noProxyAddress warning', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        proxyAddress: undefined,
      })
      expect(warningMessages).to.deep.equal(['noProxyAddress'])
    })
    it('Should show depositAmountEmpty warning', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        depositAmount: undefined,
      })
      expect(warningMessages).to.deep.equal(['depositAmountEmpty'])
    })
    it('Should show generateAmountEmpty warning', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        generateAmount: undefined,
      })
      expect(warningMessages).to.deep.equal(['generateAmountEmpty'])
    })

    it('Should show potentialGenerateAmountLessThanDebtFloor warning when debtFloor is slightly higher that depositAmountUSD', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        debtFloor: openVaultState.depositAmountUSD.multipliedBy(SLIGHTLY_MORE_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal(['potentialGenerateAmountLessThanDebtFloor'])
    })
    it('Should not show potentialGenerateAmountLessThanDebtFloor warning when debtFloor is slightly lower that depositAmountUSD', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        debtFloor: openVaultState.depositAmountUSD.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal([])
    })
    it('Should show noAllowance warning when allowance is not set', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        allowance: undefined,
      })
      expect(warningMessages).to.deep.equal(['noAllowance'])
    })
    it('Should show noAllowance warning when allowance is zero', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        allowance: zero,
      })
      expect(warningMessages).to.deep.equal(['noAllowance', 'allowanceLessThanDepositAmount'])
    })
    it('Should show allowanceLessThanDepositAmount warning when allowance is not enough', () => {
      const { warningMessages } = validateWarnings({
        ...openVaultState,
        allowance: openVaultState.depositAmount.multipliedBy(SLIGHTLY_LESS_THAN_ONE),
      })
      expect(warningMessages).to.deep.equal(['allowanceLessThanDepositAmount'])
    })
  })
})
