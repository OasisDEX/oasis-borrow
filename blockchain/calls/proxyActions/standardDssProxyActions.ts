import { DssProxyActions } from '../../../types/web3-v1-contracts/dss-proxy-actions'
import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../network'
import { amountToWei } from '../../utils'
import { DepositAndGenerateData, WithdrawAndPaybackData } from '../proxyActions'
import { DssProxyActionInterface } from './DssProxyActionInterface'

export const StandardDssProxyActions: DssProxyActionInterface = {
  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.draw(
        context.dssCdpManager.address,
        context.mcdJug.address,
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
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
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.lockETH(context.dssCdpManager.address, context.joins[data.ilk], data.id.toString())
  },

  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.lockETHAndDraw(
        context.dssCdpManager.address,
        context.mcdJug.address,
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  },

  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.lockGem(
        context.dssCdpManager.address,
        context.joins[data.ilk],
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
        true,
      )
  },

  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.lockGemAndDraw(
        context.dssCdpManager.address,
        context.mcdJug.address,
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
        true,
      )
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
