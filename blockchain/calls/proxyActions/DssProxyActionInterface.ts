// either a standard proxy action or chartered
import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../network'
import {
  DepositAndGenerateData,
  DssProxyActionsType,
  WithdrawAndPaybackData,
} from '../proxyActions'
import { StandardDssProxyActions } from './standardDssProxyActions'

export interface DssProxyActionInterface {
  // for getDepositAndGenerateCallData
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

  // for getWithdrawAndPaybackCallData
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

export function proxyActionFactory(proxyType: DssProxyActionsType): DssProxyActionInterface {
  if (proxyType === 'standard') {
    return StandardDssProxyActions
  } else {
    throw 'chartered not implemented'
  }
}
