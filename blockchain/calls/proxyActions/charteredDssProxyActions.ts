import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../network'
import { amountToWei, amountToWeiRoundDown } from '../../utils'
import { DepositAndGenerateData, WithdrawAndPaybackData } from '../proxyActions'
import { DssProxyActionInterface } from './DssProxyActionInterface'
import { DssProxyActionsCharter } from '../../../types/ethers-contracts'

export const StandardDssProxyActions: DssProxyActionInterface = {
  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.draw(
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
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.freeETH(
        context.joins[data.ilk],
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.freeGem(
        context.joins[data.ilk],
        data.id.toString(),
        amountToWeiRoundDown(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.lockETH(context.dssCdpManager.address, context.joins[data.ilk], data.id.toString())
  },

  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.lockETHAndDraw(
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
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.lockGem(
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
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.lockGemAndDraw(
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
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.wipe(
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },

  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.wipeAll(context.mcdJoinDai.address, data.id.toString())
  },

  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.wipeAllAndFreeETH(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.wipeAllAndFreeGem(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.wipeAndFreeETH(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },

  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsCharter>(context.dssProxyActionsCharter)
      .methods.wipeAndFreeGem(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },
}
