import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { amountToWei, amountToWeiRoundDown } from 'blockchain/utils'
import type { DssProxyActions } from 'types/web3-v1-contracts'
import type {
  NonPayableTransactionObject,
  PayableTransactionObject,
} from 'types/web3-v1-contracts/types'
import Web3 from 'web3'

import type {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  ProxyActionsSmartContractAdapterInterface,
  WithdrawAndPaybackData,
} from './ProxyActionsSmartContractAdapterInterface'
import { ProxyActionsAdapterType } from './ProxyActionsSmartContractAdapterInterface'

export const StandardDssProxyActionsContractAdapter: ProxyActionsSmartContractAdapterInterface = {
  AdapterType: ProxyActionsAdapterType.STANDARD,

  openLockETHAndDraw(context: ContextConnected, data: OpenData): PayableTransactionObject<string> {
    const { contract } = context
    const { dssCdpManager, dssProxyActions, mcdJoinDai, mcdJug, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    const { generateAmount, ilk } = data
    return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(generateAmount, 'DAI').toFixed(0),
    )
  },

  openLockGemAndDraw(
    context: ContextConnected,
    data: OpenData,
  ): NonPayableTransactionObject<string> {
    const { contract } = context
    const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    const { depositAmount, generateAmount, token, ilk } = data
    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(depositAmount, token).toFixed(0),
      amountToWei(generateAmount, 'DAI').toFixed(0),
      true,
    )
  },

  open(context: ContextConnected, data: OpenData): NonPayableTransactionObject<string> {
    const { contract } = context
    const { dssProxyActions, dssCdpManager } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    const { ilk, proxyAddress } = data
    return contract<DssProxyActions>(dssProxyActions).methods.open(
      dssCdpManager.address,
      Web3.utils.utf8ToHex(ilk),
      proxyAddress,
    )
  },

  resolveContractAddress(context: ContextConnected): string {
    const { dssProxyActions } = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
    return dssProxyActions.address
  },

  draw(context: ContextConnected, data: DepositAndGenerateData): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJug, mcdJoinDai } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.draw(
        dssCdpManager.address,
        mcdJug.address,
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  },

  freeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.freeETH(
        dssCdpManager.address,
        joins[data.ilk],
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  freeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.freeGem(
        dssCdpManager.address,
        joins[data.ilk],
        data.id.toString(),
        amountToWeiRoundDown(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  lockETH(context: ContextConnected, data: DepositAndGenerateData): PayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.lockETH(dssCdpManager.address, joins[data.ilk], data.id.toString())
  },

  lockETHAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): PayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, joins, mcdJug, mcdJoinDai } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.lockETHAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
      )
  },

  lockGem(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.lockGem(
        dssCdpManager.address,
        joins[data.ilk],
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
        true,
      )
  },

  lockGemAndDraw(
    context: ContextConnected,
    data: DepositAndGenerateData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, joins, mcdJug, mcdJoinDai } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.lockGemAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.depositAmount, data.token).toFixed(0),
        amountToWei(data.generateAmount, 'DAI').toFixed(0),
        true,
      )
  },

  wipe(context: ContextConnected, data: WithdrawAndPaybackData): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJoinDai } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.wipe(
        dssCdpManager.address,
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },

  wipeAll(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJoinDai } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.wipeAll(dssCdpManager.address, mcdJoinDai.address, data.id.toString())
  },

  wipeAllAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJoinDai, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.wipeAllAndFreeETH(
        dssCdpManager.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  wipeAllAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJoinDai, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.wipeAllAndFreeGem(
        dssCdpManager.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
      )
  },

  wipeAndFreeETH(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJoinDai, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.wipeAndFreeETH(
        dssCdpManager.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },

  wipeAndFreeGem(
    context: ContextConnected,
    data: WithdrawAndPaybackData,
  ): NonPayableTransactionObject<void> {
    const { dssProxyActions, dssCdpManager, mcdJoinDai, joins } = getNetworkContracts(
      NetworkIds.MAINNET,
      context.chainId,
    )
    return context
      .contract<DssProxyActions>(dssProxyActions)
      .methods.wipeAndFreeGem(
        dssCdpManager.address,
        joins[data.ilk],
        mcdJoinDai.address,
        data.id.toString(),
        amountToWei(data.withdrawAmount, data.token).toFixed(0),
        amountToWei(data.paybackAmount, 'DAI').toFixed(0),
      )
  },

  claimRewards(
    _context: ContextConnected,
    _data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    throw new Error('standard vaults do not support claiming rewards/bonuses')
  },
}
