import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { amountToWei, amountToWeiRoundDown } from 'blockchain/utils'
import type { ContractDesc } from 'features/web3Context'
import type { DssProxyActionsCharter, DssProxyActionsCropjoin } from 'types/web3-v1-contracts'
import type {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from 'types/web3-v1-contracts/types'
import Web3 from 'web3'

import type {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  ProxyActionsAdapterType,
  ProxyActionsSmartContractAdapterInterface,
  WithdrawAndPaybackData,
} from './ProxyActionsSmartContractAdapterInterface'

// Adapter for maker protocol proxy actions that does not require a `manager`.  These proxy actions
// use the CDP Registry instead, on the maker protocol side.
// https://docs.google.com/presentation/d/10eXe7CZCVqwafg7kQiSMpJEF8CAVuE78ovylJyOXsm8/edit#slide=id.g10e6e999398_0_151
export abstract class ManagerlessProxyActionsContractAdapter<
  DssProxyActionsType extends DssProxyActionsCharter | DssProxyActionsCropjoin,
> implements ProxyActionsSmartContractAdapterInterface
{
  abstract AdapterType: ProxyActionsAdapterType

  resolveContractAddress(context: ContextConnected): string {
    return this.resolveContractDesc(context).address
  }

  protected abstract resolveContractDesc(context: ContextConnected): ContractDesc

  open(context: ContextConnected, data: OpenData): NonPayableTransactionObject<string> {
    const { contract } = context
    const { ilk, proxyAddress } = data
    return contract<DssProxyActionsType>(this.resolveContractDesc(context)).methods.open(
      Web3.utils.utf8ToHex(ilk),
      proxyAddress,
    )
  }

  openLockETHAndDraw(context: ContextConnected, data: OpenData): PayableTransactionObject<string> {
    const { contract } = context
    const { mcdJoinDai, mcdJug, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    const { generateAmount, ilk } = data
    return contract<DssProxyActionsType>(
      this.resolveContractDesc(context),
    ).methods.openLockETHAndDraw(
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(generateAmount, 'DAI').toFixed(0),
    )
  }

  openLockGemAndDraw(
    context: ContextConnected,
    data: OpenData,
  ): NonPayableTransactionObject<string> {
    const { contract } = context
    const { mcdJoinDai, mcdJug, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    const { depositAmount, generateAmount, token, ilk } = data
    return contract<DssProxyActionsType>(
      this.resolveContractDesc(context),
    ).methods.openLockGemAndDraw(
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(depositAmount, token).toFixed(0),
      amountToWei(generateAmount, 'DAI').toFixed(0),
    )
  }

  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    const { mcdJoinDai, mcdJug } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.draw(
        mcdJug.address,
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  }

  freeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.freeETH(
        joins[data.ilk],
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.freeGem(
        joins[data.ilk],
        data.id.toString(),
        amountToWeiRoundDown(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    const { joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockETH(joins[data.ilk], data.id.toString())
  }

  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    const { mcdJoinDai, mcdJug, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockETHAndDraw(
        mcdJug.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  }

  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    const { joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockGem(
        joins[data.ilk],
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
      )
  }

  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    const { mcdJoinDai, mcdJug, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.lockGemAndDraw(
        mcdJug.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  }

  wipe(context: ContextConnected, data: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    const { mcdJoinDai } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipe(
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  }

  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { mcdJoinDai } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAll(mcdJoinDai.address, data.id.toString())
  }

  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { mcdJoinDai, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAllAndFreeETH(
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { mcdJoinDai, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAllAndFreeGem(
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  }

  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { mcdJoinDai, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAndFreeETH(
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  }

  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { mcdJoinDai, joins } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return context
      .contract<DssProxyActionsType>(this.resolveContractDesc(context))
      .methods.wipeAndFreeGem(
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  }

  abstract claimRewards(
    context: ContextConnected,
    data: ClaimRewardData,
  ): NonPayableTransactionObject<void>
}
