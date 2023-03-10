import { BigNumber } from 'bignumber.js'

import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import { TxMetaKind } from '../../txMeta'

export type WithdrawAndPaybackData = {
  kind: TxMetaKind.withdrawAndPayback
  id: BigNumber
  token: string
  ilk: string
  withdrawAmount: BigNumber
  paybackAmount: BigNumber
  proxyAddress: string
  shouldPaybackAll: boolean
}

export type DepositAndGenerateData = {
  kind: TxMetaKind.depositAndGenerate
  id: BigNumber
  token: string
  ilk: string
  depositAmount: BigNumber
  generateAmount: BigNumber
  proxyAddress: string
}

export type OpenData = {
  kind: TxMetaKind.open
  token: string
  ilk: string
  depositAmount: BigNumber
  generateAmount: BigNumber
  proxyAddress: string
}

export type ClaimRewardData = {
  kind: TxMetaKind.claimReward
  gemJoinAddress: string
  cdpId: BigNumber
  proxyAddress: string
}

export enum ProxyActionsAdapterType {
  STANDARD = 'STANDARD',
  CHARTER = 'CHARTER',
  CROPJOIN = 'CROPJOIN',
  MOCK = 'MOCK',
}

export interface ProxyActionsSmartContractAdapterInterface {
  resolveContractAddress: (context: ContextConnected) => string

  // used for testing
  AdapterType: ProxyActionsAdapterType

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

  openLockETHAndDraw: (
    context: ContextConnected,
    data: OpenData,
  ) => PayableTransactionObject<string>

  openLockGemAndDraw: (
    context: ContextConnected,
    data: OpenData,
  ) => NonPayableTransactionObject<string>

  open: (context: ContextConnected, data: OpenData) => NonPayableTransactionObject<string>

  claimRewards: (
    context: ContextConnected,
    data: ClaimRewardData,
  ) => NonPayableTransactionObject<void>
}
