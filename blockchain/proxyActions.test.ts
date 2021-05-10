import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { one, zero } from 'helpers/zero'

import { getWithdrawAndPaybackCallData } from './calls/proxyActions'
import { TxMetaKind } from './calls/txMeta'

interface ConstructWithdrawAndPaybackProps {
  token: 'ETH' | 'WBTC'
  withdrawAmount?: BigNumber
  paybackAmount?: BigNumber
  shouldPaybackAll?: boolean
}

function constructWithdrawAndPayback({
  token,
  withdrawAmount = zero,
  paybackAmount = zero,
  shouldPaybackAll = false,
}: ConstructWithdrawAndPaybackProps): string {
  return (getWithdrawAndPaybackCallData(
    {
      kind: TxMetaKind.withdrawAndPayback,
      proxyAddress: '0xProxyAddress',
      id: one,
      token,
      withdrawAmount,
      paybackAmount,
      ilk: `${token}-A`,
      shouldPaybackAll,
    },
    mockContextConnected,
  ) as any)._method.name
}

describe('ProxyActions', () => {
  describe('WithdrawAndPayback', () => {
    it('should call wipeAllAndFreeETH() when withdrawAmount & paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is true', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'ETH',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAllAndFreeETH')
    })

    it('should call wipeAndFreeETH() when withdrawAmount & paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is false', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'ETH',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
        }),
      ).to.deep.equal('wipeAndFreeETH')
    })

    it('should call wipeAllAndFreeGem() when withdrawAmount & paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is true', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'WBTC',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAllAndFreeGem')
    })

    it('should call wipeAndFreeGem() when withdrawAmount & paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is false', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'WBTC',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
        }),
      ).to.deep.equal('wipeAndFreeGem')
    })

    it('should call freeETH() when withdrawAmount is greater than zero, paybackAmount is zero, token is ETH and the shouldPaybackAll flag is false', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'ETH',
          withdrawAmount: one,
        }),
      ).to.deep.equal('freeETH')
    })

    it('should call freeGem() when withdrawAmount is greater than zero, paybackAmount is zero, token is WBTC and the shouldPaybackAll flag is false', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'WBTC',
          withdrawAmount: one,
        }),
      ).to.deep.equal('freeGem')
    })

    it('should call wipeAll() when withdrawAmount is zero, paybackAmount is greater than zero, token is ETH/WBTC and the shouldPaybackAll flag is true', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'WBTC',
          paybackAmount: new BigNumber('1000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAll')
      expect(
        constructWithdrawAndPayback({
          token: 'ETH',
          paybackAmount: new BigNumber('1000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAll')
    })

    it('should call wipe() when withdrawAmount is zero, paybackAmount is greater than zero, token is ETH/WBTC and the shouldPaybackAll flag is false', () => {
      expect(
        constructWithdrawAndPayback({
          token: 'WBTC',
          paybackAmount: new BigNumber('1000'),
        }),
      ).to.deep.equal('wipe')
      expect(
        constructWithdrawAndPayback({
          token: 'ETH',
          paybackAmount: new BigNumber('1000'),
        }),
      ).to.deep.equal('wipe')
    })
  })
})
