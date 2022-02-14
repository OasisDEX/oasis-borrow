import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { one, zero } from 'helpers/zero'
import { describe } from 'mocha'

import { PROXY_ACTIONS } from './addresses/mainnet.json'
import { CharteredDssProxyActionsContractWrapper } from './calls/proxyActions/charteredDssProxyActionsContractWrapper'
import { DssProxyActionsSmartContractWrapperInterface } from './calls/proxyActions/DssProxyActionsSmartContractWrapperInterface'
import {
  DepositAndGenerateData,
  getDepositAndGenerateCallData,
  getWithdrawAndPaybackCallData,
  WithdrawAndPaybackData,
  withdrawPaybackDepositGenerateLogicFactory,
} from './calls/proxyActions/proxyActions'
import { StandardDssProxyActionsContractWrapper } from './calls/proxyActions/standardDssProxyActionsContractWrapper'
import { TxMetaKind } from './calls/txMeta'

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

    function runTest(
      dssProxyAction: DssProxyActionsSmartContractWrapperInterface,
      expectedAddress: string,
    ): void {
      const proxyAction = withdrawPaybackDepositGenerateLogicFactory(dssProxyAction)

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
      runTest(StandardDssProxyActionsContractWrapper, mockContextConnected.dssProxyActions.address)
    })

    it('uses dssProxyActionsCharter contract for institutional vaults', () => {
      runTest(
        CharteredDssProxyActionsContractWrapper,
        mockContextConnected.dssProxyActionsCharter.address,
      )
    })
  })

  describe('getWithdrawAndPaybackCallData', () => {
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
        StandardDssProxyActionsContractWrapper,
      ) as any)._method.name
    }

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

  describe('getDepositAndGenerateCallData', () => {
    interface TestData {
      testName: string
      depositAmount: number
      generateAmount: number
      expectedMethodCalled: string
      token: 'ETH' | 'WBTC'
    }

    function runTest({
      testName,
      depositAmount,
      generateAmount,
      expectedMethodCalled,
      token,
    }: TestData): void {
      const depositAmountBigNumber = new BigNumber(depositAmount)
      const generateAmountBigNumber = new BigNumber(generateAmount)
      const actualMethodName = (getDepositAndGenerateCallData(
        {
          kind: TxMetaKind.depositAndGenerate,
          proxyAddress: '0xProxyAddress',
          id: one,
          token,
          depositAmount: depositAmountBigNumber,
          generateAmount: generateAmountBigNumber,
          ilk: `${token}-A`,
        },
        mockContextConnected,
        StandardDssProxyActionsContractWrapper,
      ) as any)._method.name

      it(testName, () => {
        expect(actualMethodName).to.eq(expectedMethodCalled)
      })
    }

    const testData: TestData[] = [
      {
        testName:
          'should call lockETHAndDraw() when depositAmount and generateAmount are greater than zero, token is ETH',
        depositAmount: 1,
        generateAmount: 1,
        expectedMethodCalled: 'lockETHAndDraw',
        token: 'ETH',
      },
      {
        testName:
          'should call lockGemAndDraw() when depositAmount and generateAmount are greater than zero, token is not ETH',
        depositAmount: 1,
        generateAmount: 1,
        expectedMethodCalled: 'lockGemAndDraw',
        token: 'WBTC',
      },
      {
        testName:
          'should call lockETH() when depositAmount is greater than zero and generateAmount is zero, token is ETH',
        depositAmount: 1,
        generateAmount: 0,
        expectedMethodCalled: 'lockETH',
        token: 'ETH',
      },
      {
        testName:
          'should call lockGem() when depositAmount is greater than zero and generateAmount is zero, token is not ETH',
        depositAmount: 1,
        generateAmount: 0,
        expectedMethodCalled: 'lockGem',
        token: 'WBTC',
      },
      {
        testName: 'should call draw() when depositAmount and generateAmount are zero, token is ETH',
        depositAmount: 0,
        generateAmount: 0,
        expectedMethodCalled: 'draw',
        token: 'ETH',
      },
      {
        testName:
          'should call draw() when depositAmount and generateAmount are zero, token is not ETH',
        depositAmount: 0,
        generateAmount: 0,
        expectedMethodCalled: 'draw',
        token: 'WBTC',
      },
    ]

    testData.forEach(runTest)
  })
})
