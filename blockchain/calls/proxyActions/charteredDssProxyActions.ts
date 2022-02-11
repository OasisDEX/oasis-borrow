import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../network'
import { DepositAndGenerateData, WithdrawAndPaybackData } from '../proxyActions'
import { DssProxyActionInterface } from './DssProxyActionInterface'

export const CharteredDssProxyActions: DssProxyActionInterface = {
  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  freeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  wipe(context: ContextConnected, data: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },

  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw new Error('unimplemented')
  },
}
