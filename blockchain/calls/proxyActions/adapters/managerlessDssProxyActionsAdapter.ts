import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCharter } from '../../../../types/web3-v1-contracts/dss-proxy-actions-charter'
import { DssProxyActionsCurve } from '../../../../types/web3-v1-contracts/dss-proxy-actions-curve'
import {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import { amountToWei, amountToWeiRoundDown } from '../../../utils'
import {
  DepositAndGenerateData,
  DssProxyActionsSmartContractWrapperInterface,
  OpenData,
  WithdrawAndPaybackData,
} from './DssProxyActionsSmartContractWrapperInterface'

export abstract class ManagerlessDssProxyActionsContractWrapper<
  DssProxyActionsType extends DssProxyActionsCharter | DssProxyActionsCurve
> implements DssProxyActionsSmartContractWrapperInterface {
  resolveContractAddress(context: ContextConnected): string {
    return this.resolveContractDesc(context).address
  }

  abstract resolveContractDesc(context: ContextConnected): ContractDesc

  open(context: ContextConnected, data: OpenData): NonPayableTransactionObject<string> {
    throw 'cannot open chartered vault manually'
  }

  openLockETHAndDraw(context: ContextConnected, data: OpenData): PayableTransactionObject<string> {
    throw 'cannot open chartered vault manually'
  }

  openLockGemAndDraw(
    context: ContextConnected,
    data: OpenData,
  ): NonPayableTransactionObject<string> {
    throw 'cannot open chartered vault manually'
  }

  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.draw(
        context.mcdJug.address,
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  }

  freeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.freeETH(
        context.joins[data.ilk],
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.freeGem(
        context.joins[data.ilk],
        data.id.toString(),
        amountToWeiRoundDown(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockETH(context.joins[data.ilk], data.id.toString())
  }

  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockETHAndDraw(
        context.mcdJug.address,
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  }

  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockGem(
        context.joins[data.ilk],
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
      )
  }

  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockGemAndDraw(
        context.mcdJug.address,
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  }

  wipe(context: ContextConnected, data: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipe(
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  }

  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAll(context.mcdJoinDai.address, data.id.toString())
  }

  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAllAndFreeETH(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAllAndFreeGem(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAndFreeETH(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  }

  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAndFreeGem(
        context.joins[data.ilk],
        context.mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  }
}
