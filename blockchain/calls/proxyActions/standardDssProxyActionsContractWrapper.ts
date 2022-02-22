import { DssProxyActions } from '../../../types/web3-v1-contracts/dss-proxy-actions'
import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../network'
import { amountToWei, amountToWeiRoundDown } from '../../utils'
import { DssProxyActionsSmartContractWrapperInterface } from './DssProxyActionsSmartContractWrapperInterface'
import { DepositAndGenerateData, WithdrawAndPaybackData } from './proxyActions'

export const StandardDssProxyActionsContractWrapper: DssProxyActionsSmartContractWrapperInterface = {
  resolveContractAddress(context: ContextConnected): string {
    return context.dssProxyActions.address
  },

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
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.freeETH(
        context.dssCdpManager.address,
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
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.freeGem(
        context.dssCdpManager.address,
        context.joins[data.ilk],
        data.id.toString(),
        amountToWeiRoundDown(data.withdrawAmount, data.token).toFixed(0),
      )
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
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.wipe(
        context.dssCdpManager.address,
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
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.wipeAll(
        context.dssCdpManager.address,
        context.mcdJoinDai.address,
        data.id.toString(),
      )
  },

  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.wipeAllAndFreeETH(
        context.dssCdpManager.address,
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
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.wipeAllAndFreeGem(
        context.dssCdpManager.address,
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
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.wipeAndFreeETH(
        context.dssCdpManager.address,
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
      .contract<DssProxyActions>(context.dssProxyActions)
      .methods.wipeAndFreeGem(
        context.dssCdpManager.address,
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },
}
