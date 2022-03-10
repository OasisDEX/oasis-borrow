import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import { DssProxyActionsSmartContractWrapperInterface } from './DssProxyActionsSmartContractWrapperInterface'
import { DepositAndGenerateData, OpenData, WithdrawAndPaybackData } from '../proxyActions'

export const CurveDssProxyActionsSmartContractWrapper: DssProxyActionsSmartContractWrapperInterface = {
  open(context: ContextConnected, data: OpenData): NonPayableTransactionObject<string> {
    throw 'unimplemented'
  },

  openLockETHAndDraw(context: ContextConnected, data: OpenData): PayableTransactionObject<string> {
    throw 'unimplemented'
  },

  openLockGemAndDraw(
    context: ContextConnected,
    data: OpenData,
  ): NonPayableTransactionObject<string> {
    throw 'unimplemented'
  },
  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  freeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    throw 'unimplemented'
  },
  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    throw 'unimplemented'
  },
  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  resolveContractAddress(context: ContextConnected): string {
    return context.dssProxyActionsCurve.address
  },
  wipe(context: ContextConnected, data: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    throw 'unimplemented'
  },
}
