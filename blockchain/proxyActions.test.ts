import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { one, zero } from 'helpers/zero'

import { getWithdrawAndPaybackCallData } from './calls/proxyActions'
import { TxMetaKind } from './calls/txMeta'
import { protoContextConnected } from './network'

describe.only('ProxyActions', () => {
  describe('WithdrawAndPayback', () => {
    interface CallDataProps {
      token: 'ETH' | 'WBTC'
      withdrawAmount?: BigNumber
      paybackAmount?: BigNumber
      shouldPaybackAll?: boolean
    }
    function getCall({
      token,
      withdrawAmount = zero,
      paybackAmount = zero,
      shouldPaybackAll = false,
    }: CallDataProps): string {
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
        protoContextConnected,
      ) as any)._method.name
    }
    it('should call wipeAllAndFreeETH() when withdrawAmount & paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is true', () => {
      expect(
        getCall({
          token: 'ETH',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAllAndFreeETH')
    })

    it('should call wipeAndFreeETH() when withdrawAmount & paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is false', () => {
      expect(
        getCall({
          token: 'ETH',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
        }),
      ).to.deep.equal('wipeAndFreeETH')
    })

    it('should call wipeAllAndFreeGem() when withdrawAmount & paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is true', () => {
      expect(
        getCall({
          token: 'WBTC',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAllAndFreeGem')
    })

    it('should call wipeAndFreeGem() when withdrawAmount & paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is false', () => {
      expect(
        getCall({
          token: 'WBTC',
          withdrawAmount: one,
          paybackAmount: new BigNumber('2000'),
        }),
      ).to.deep.equal('wipeAndFreeGem')
    })

    it('should call freeETH() when withdrawAmount is greater than zero, paybackAmount is zero, token is ETH and the shouldPaybackAll flag is false', () => {
      expect(
        getCall({
          token: 'ETH',
          withdrawAmount: one,
        }),
      ).to.deep.equal('freeETH')
    })

    it('should call freeGem() when withdrawAmount is greater than zero, paybackAmount is zero, token is WBTC and the shouldPaybackAll flag is false', () => {
      expect(
        getCall({
          token: 'WBTC',
          withdrawAmount: one,
        }),
      ).to.deep.equal('freeGem')
    })

    it('should call wipeAll() when withdrawAmount is zero, paybackAmount is greater than zero, token is ETH/WBTC and the shouldPaybackAll flag is true', () => {
      expect(
        getCall({
          token: 'WBTC',
          paybackAmount: new BigNumber('1000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAll')
      expect(
        getCall({
          token: 'ETH',
          paybackAmount: new BigNumber('1000'),
          shouldPaybackAll: true,
        }),
      ).to.deep.equal('wipeAll')
    })

    it('should call wipe() when withdrawAmount is zero, paybackAmount is greater than zero, token is ETH/WBTC and the shouldPaybackAll flag is false', () => {
      expect(
        getCall({
          token: 'WBTC',
          paybackAmount: new BigNumber('1000'),
        }),
      ).to.deep.equal('wipe')
      expect(
        getCall({
          token: 'ETH',
          paybackAmount: new BigNumber('1000'),
        }),
      ).to.deep.equal('wipe')
    })
  })
})
