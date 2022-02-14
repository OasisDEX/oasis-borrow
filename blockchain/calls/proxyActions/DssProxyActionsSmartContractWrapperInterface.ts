import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../network'
import { DepositAndGenerateData, WithdrawAndPaybackData } from './proxyActions'

export interface DssProxyActionsSmartContractWrapperInterface {
  resolveContractAddress: (context: ContextConnected) => string

  lockETHAndDraw: (
    context: ContextConnected,
    data: DepositAndGenerateData,
  ) => PayableTransactionObject<void>

  lockGemAndDraw: (
    context: ContextConnected,
    data: DepositAndGenerateData,
  ) => NonPayableTransactionObject<void>

  lockETH: (
    context: ContextConnected,
    data: DepositAndGenerateData,
  ) => PayableTransactionObject<void>

  lockGem: (
    context: ContextConnected,
    data: DepositAndGenerateData,
  ) => NonPayableTransactionObject<void>

  draw: (
    context: ContextConnected,
    data: DepositAndGenerateData,
  ) => NonPayableTransactionObject<void>

  wipeAllAndFreeETH: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  wipeAndFreeETH: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  wipeAllAndFreeGem: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  wipeAndFreeGem: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  freeETH: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  freeGem: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  wipeAll: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>

  wipe: (
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ) => NonPayableTransactionObject<void>
}
