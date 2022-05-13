import {
  NonPayableTransactionObject,
  PayableTransactionObject,
  PayableTx,
} from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  ProxyActionsAdapterType,
  ProxyActionsSmartContractAdapterInterface,
  WithdrawAndPaybackData,
} from './ProxyActionsSmartContractAdapterInterface'

function createMockPayableTransactionObject<T>(name: string): PayableTransactionObject<T> {
  return {
    arguments: [],
    call: (_?: PayableTx) => {
      throw new Error('not implemented')
    },
    encodeABI: () => {
      const call = {
        method: name,
      }
      return JSON.stringify(call)
    },
    estimateGas: (_?: PayableTx) => {
      throw new Error('not implemented')
    },
    send: (_?: PayableTx) => {
      throw new Error('not implemented')
    },
  }
}

export const MockProxyActionsSmartContractAdapter: ProxyActionsSmartContractAdapterInterface = {
  claimRewards(
    _context: ContextConnected,
    _data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject<void>('claimRewards')
  },
  AdapterType: ProxyActionsAdapterType.MOCK,

  open(_: ContextConnected, __: OpenData): NonPayableTransactionObject<string> {
    return createMockPayableTransactionObject<string>('open')
  },
  openLockETHAndDraw(_: ContextConnected, __: OpenData): PayableTransactionObject<string> {
    return createMockPayableTransactionObject('openLockETHAndDraw')
  },
  openLockGemAndDraw(_: ContextConnected, __: OpenData): NonPayableTransactionObject<string> {
    return createMockPayableTransactionObject('openLockGemAndDraw')
  },
  draw(_: ContextConnected, __: DepositAndGenerateData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('draw')
  },
  freeETH(_: ContextConnected, __: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('freeETH')
  },
  freeGem(_: ContextConnected, __: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('freeGem')
  },
  lockETH(_: ContextConnected, __: DepositAndGenerateData): PayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockETH')
  },
  lockETHAndDraw(_: ContextConnected, __: DepositAndGenerateData): PayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockETHAndDraw')
  },
  lockGem(_: ContextConnected, __: DepositAndGenerateData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockGem')
  },
  lockGemAndDraw(
    _: ContextConnected,
    __: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('lockGemAndDraw')
  },
  resolveContractAddress(_: ContextConnected): string {
    return '0x-mock-dss-proxy-action-address'
  },
  wipe(_: ContextConnected, __: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipe')
  },
  wipeAll(_: ContextConnected, __: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAll')
  },
  wipeAllAndFreeETH(
    _: ContextConnected,
    __: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAllAndFreeETH')
  },
  wipeAllAndFreeGem(
    _: ContextConnected,
    __: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAllAndFreeGem')
  },
  wipeAndFreeETH(
    _: ContextConnected,
    __: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAndFreeETH')
  },
  wipeAndFreeGem(
    _: ContextConnected,
    __: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return createMockPayableTransactionObject('wipeAndFreeGem')
  },
}
