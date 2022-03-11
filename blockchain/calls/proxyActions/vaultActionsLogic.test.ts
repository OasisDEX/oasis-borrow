import { BigNumber } from 'bignumber.js'
import { expect } from 'chai'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { one } from 'helpers/zero'
import { describe } from 'mocha'

import { TxMetaKind } from '../txMeta'
import { MockProxyActionsSmartContractAdapter } from './adapters/mockProxyActionsSmartContractAdapter'
import { vaultActionsLogic } from './vaultActionsLogic'

describe('vaultActionsLogic', () => {
  describe('withdrawAndPayback', () => {
    type TestData = {
      testName: string
      token: 'ETH' | 'WBTC'
      withdrawAmount: number
      paybackAmount: number
      shouldPaybackAll: boolean
      expectedMethodName: string
    }

    function runTest({
      testName,
      token,
      withdrawAmount,
      paybackAmount,
      shouldPaybackAll,
      expectedMethodName,
    }: TestData) {
      const withdrawAmountBigNumber = new BigNumber(withdrawAmount)
      const paybackAmountBigNumber = new BigNumber(paybackAmount)

      const proxyActionCall = vaultActionsLogic(
        MockProxyActionsSmartContractAdapter,
      ).withdrawAndPayback.prepareArgs(
        {
          kind: TxMetaKind.withdrawAndPayback,
          proxyAddress: '0xProxyAddress',
          id: one,
          token,
          withdrawAmount: withdrawAmountBigNumber,
          paybackAmount: paybackAmountBigNumber,
          shouldPaybackAll,
          ilk: `${token}-A`,
        },
        mockContextConnected,
      )

      const proxyActionAddress = proxyActionCall[0]

      const methodCalled = proxyActionCall[1] as string
      const actualMethodName = JSON.parse(methodCalled).method

      it(testName, () => {
        expect(actualMethodName).to.eq(expectedMethodName)
        expect(proxyActionAddress).to.eq('0x-mock-dss-proxy-action-address')
      })
    }

    const tests: Array<TestData> = [
      {
        testName:
          'should call wipeAllAndFreeETH() when withdrawAmount & paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is true',
        token: 'ETH',
        withdrawAmount: 1,
        paybackAmount: 2000,
        shouldPaybackAll: true,
        expectedMethodName: 'wipeAllAndFreeETH',
      },
      {
        testName:
          'should call wipeAndFreeETH() when withdrawAmount & paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is false',
        token: 'ETH',
        withdrawAmount: 1,
        paybackAmount: 2000,
        shouldPaybackAll: false,
        expectedMethodName: 'wipeAndFreeETH',
      },

      {
        testName:
          'should call wipeAllAndFreeGem() when withdrawAmount & paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is true',
        token: 'WBTC',
        withdrawAmount: 1,
        paybackAmount: 2000,
        shouldPaybackAll: true,
        expectedMethodName: 'wipeAllAndFreeGem',
      },

      {
        testName:
          'should call wipeAndFreeGem() when withdrawAmount & paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is false',
        token: 'WBTC',
        withdrawAmount: 1,
        paybackAmount: 2000,
        shouldPaybackAll: false,
        expectedMethodName: 'wipeAndFreeGem',
      },

      {
        testName:
          'should call freeETH() when withdrawAmount is greater than zero, paybackAmount is zero, token is ETH and the shouldPaybackAll flag is false',
        token: 'ETH',
        withdrawAmount: 1,
        paybackAmount: 0,
        shouldPaybackAll: false,
        expectedMethodName: 'freeETH',
      },

      {
        testName:
          'should call freeGem() when withdrawAmount is greater than zero, paybackAmount is zero, token is WBTC and the shouldPaybackAll flag is false',
        token: 'WBTC',
        withdrawAmount: 1,
        paybackAmount: 0,
        shouldPaybackAll: false,
        expectedMethodName: 'freeGem',
      },

      {
        testName:
          'should call wipeAll() when withdrawAmount is zero, paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is true',
        token: 'ETH',
        withdrawAmount: 0,
        paybackAmount: 1000,
        shouldPaybackAll: true,
        expectedMethodName: 'wipeAll',
      },

      {
        testName:
          'should call wipeAll() when withdrawAmount is zero, paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is true',
        token: 'WBTC',
        withdrawAmount: 0,
        paybackAmount: 1000,
        shouldPaybackAll: true,
        expectedMethodName: 'wipeAll',
      },

      {
        testName:
          'should call wipe() when withdrawAmount is zero, paybackAmount is greater than zero, token is ETH and the shouldPaybackAll flag is false',
        token: 'ETH',
        withdrawAmount: 0,
        paybackAmount: 1000,
        shouldPaybackAll: false,
        expectedMethodName: 'wipe',
      },

      {
        testName:
          'should call wipe() when withdrawAmount is zero, paybackAmount is greater than zero, token is WBTC and the shouldPaybackAll flag is false',
        token: 'WBTC',
        withdrawAmount: 0,
        paybackAmount: 1000,
        shouldPaybackAll: false,
        expectedMethodName: 'wipe',
      },
    ]

    tests.forEach(runTest)
  })

  describe('depositAndGenerate', () => {
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

      const proxyActionCall = vaultActionsLogic(
        MockProxyActionsSmartContractAdapter,
      ).depositAndGenerate.prepareArgs(
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
      )

      const proxyActionAddress = proxyActionCall[0]

      const methodCalled = proxyActionCall[1] as string
      const actualMethodName = JSON.parse(methodCalled).method

      it(testName, () => {
        expect(actualMethodName).to.eq(expectedMethodCalled)
        expect(proxyActionAddress).to.eq('0x-mock-dss-proxy-action-address')
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

  describe('open', () => {
    type TestData = {
      testName: string
      depositAmount: number
      generateAmount: number
      token: 'ETH' | 'WBTC'
      expectedMethod: string
    }

    function runTest({
      testName,
      depositAmount,
      generateAmount,
      expectedMethod,
      token,
    }: TestData): void {
      const depositAmountBigNumber = new BigNumber(depositAmount)
      const generateAmountBigNumber = new BigNumber(generateAmount)

      const proxyActionCall = vaultActionsLogic(
        MockProxyActionsSmartContractAdapter,
      ).open.prepareArgs(
        {
          kind: TxMetaKind.open,
          proxyAddress: '0xProxyAddress',
          token,
          depositAmount: depositAmountBigNumber,
          generateAmount: generateAmountBigNumber,
          ilk: `${token}-A`,
        },
        mockContextConnected,
      )

      const proxyActionAddress = proxyActionCall[0]

      const methodCalled = proxyActionCall[1] as string
      const actualMethodName = JSON.parse(methodCalled).method

      it(testName, () => {
        expect(actualMethodName).to.eq(expectedMethod)
        expect(proxyActionAddress).to.eq('0x-mock-dss-proxy-action-address')
      })
    }

    const tests: Array<TestData> = [
      {
        testName:
          'should call openLockETHAndDraw() when depositAmount > zero, generateAmount > zero and token is ETH',
        depositAmount: 1,
        generateAmount: 1,
        token: 'ETH',
        expectedMethod: 'openLockETHAndDraw',
      },
      {
        testName:
          'should call openLockGemAndDraw() when depositAmount > zero, generateAmount > zero and token is WBTC',
        depositAmount: 1,
        generateAmount: 1,
        token: 'WBTC',
        expectedMethod: 'openLockGemAndDraw',
      },
      {
        testName:
          'should call openLockETHAndDraw() when depositAmount > zero, generateAmount == zero and token is ETH',
        depositAmount: 1,
        generateAmount: 0,
        token: 'ETH',
        expectedMethod: 'openLockETHAndDraw',
      },
      {
        testName:
          'should call openLockGemAndDraw() when depositAmount > zero, generateAmount == zero and token is WBTC',
        depositAmount: 1,
        generateAmount: 0,
        token: 'WBTC',
        expectedMethod: 'openLockGemAndDraw',
      },

      {
        testName: 'should call open() in all other cases',
        depositAmount: 0,
        generateAmount: 0,
        token: 'WBTC',
        expectedMethod: 'open',
      },
    ]

    tests.forEach(runTest)
  })
})
