import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { one, zero } from 'helpers/zero'
import { PROXY_ACTIONS } from './addresses/mainnet.json'

import {
  DepositAndGenerateData,
  DssProxyActionsType,
  getWithdrawAndPaybackCallData,
  proxyActionsFactory,
  WithdrawAndPaybackData,
} from './calls/proxyActions'
import { TxMetaKind } from './calls/txMeta'
import { describe } from 'mocha'

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
    mockContextConnected.dssProxyActions,
  ) as any)._method.name
}

describe('ProxyActions', () => {
  describe('proxyActionsFactory', () => {
    const mockWithdrawAndPaybackData: WithdrawAndPaybackData = {
      kind: TxMetaKind.withdrawAndPayback,
      id: new BigNumber(1),
      token: 'ETH',
      ilk: 'ETH-A',
      withdrawAmount: new BigNumber(2),
      paybackAmount: new BigNumber(3),
      proxyAddress: PROXY_ACTIONS,
      shouldPaybackAll: false,
    }

    const mockDepositAndGenerateData: DepositAndGenerateData = {
      kind: TxMetaKind.depositAndGenerate,
      id: new BigNumber(1),
      token: 'ETH',
      ilk: 'ETH-A',
      depositAmount: new BigNumber(2),
      generateAmount: new BigNumber(3),
      proxyAddress: PROXY_ACTIONS,
    }

    function runTest(proxyActionType: DssProxyActionsType, expectedAddress: string): void {
      const proxyAction = proxyActionsFactory(proxyActionType)

      const withdrawAndPaybackArgs = proxyAction.withdrawAndPayback.prepareArgs(
        mockWithdrawAndPaybackData,
        mockContextConnected,
      )
      const depositAndGenerateArgs = proxyAction.depositAndGenerate.prepareArgs(
        mockDepositAndGenerateData,
        mockContextConnected,
      )

      const PROXY_ADDRESS_ARG = 0
      expect(withdrawAndPaybackArgs[PROXY_ADDRESS_ARG]).to.eq(expectedAddress)
      expect(depositAndGenerateArgs[PROXY_ADDRESS_ARG]).to.eq(expectedAddress)
    }

    it('uses dssProxyActions contract for standard vaults', () => {
      runTest('standard', mockContextConnected.dssProxyActions.address)
    })

    it('uses dssProxyActionsCharter contract for institutional vaults', () => {
      runTest('insti', mockContextConnected.dssProxyActionsCharter.address)
    })
  })
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
