import {
  NonPayableTransactionObject,
  PayableTransactionObject,
  PayableTx,
} from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import {
  DepositAndGenerateData,
  DssProxyActionsSmartContractWrapperInterface,
  OpenData,
  WithdrawAndPaybackData,
} from './DssProxyActionsSmartContractWrapperInterface'

function createMockPayableTransactionObject<T>(name: string): PayableTransactionObject<T> {
  return {
    arguments: [],
    call: (tx?: PayableTx) => {
      return Promise.reject('not implemented')
    },
    encodeABI: () => {
      const call = {
        method: name,
      }
      return JSON.stringify(call)
    },
    estimateGas: (tx?: PayableTx) => {
      return Promise.reject('not implemented')
    },
    send: (tx?: PayableTx) => {
      throw 'not implemented'
    },
  }
}

export const MockDssProxyActionsSmartContractWrapper: DssProxyActionsSmartContractWrapperInterface = {
  open(context: ContextConnected, data: OpenData): NonPayableTransactionObject<string> {
    return createMockPayableTransactionObject<string>('open')
  },
  openLockETHAndDraw(context: ContextConnected, data: OpenData): PayableTransactionObject<string> {
    return createMockPayableTransactionObject('openLockETHAndDraw')
  },
  openLockGemAndDraw(
    context: ContextConnected,
    data: OpenData,
  ): NonPayableTransactionObject<string> {
    return createMockPayableTransactionObject('openLockGemAndDraw')
  },
  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('draw')
  },
  freeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('freeETH')
  },
  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('freeGem')
  },
  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockETH')
  },
  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockETHAndDraw')
  },
  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockGem')
  },
  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockGemAndDraw')
  },
  resolveContractAddress(context: ContextConnected): string {
    return '0x-mock-dss-proxy-action-address'
  },
  wipe(context: ContextConnected, data: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipe')
  },
  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAll')
  },
  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAllAndFreeETH')
  },
  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAllAndFreeGem')
  },
  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAndFreeETH')
  },
  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAndFreeGem')
  },
}
