import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import {
  ensureContractsExist,
  ensureGivenTokensExist,
  ensureTokensExist,
  getNetworkContracts,
} from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider, networkSetById } from 'blockchain/networks'
import { amountFromWei, amountToWei } from 'blockchain/utils'
import { ethers } from 'ethers'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { safeGetAddress } from 'helpers/safeGetAddress'
import {
  AccountImplementation__factory,
  Erc20__factory,
  Erc20ProxyActions__factory,
} from 'types/ethers-contracts'

import type { BaseCallParameters, BaseTransactionParameters } from './utils'

export interface TokenBalanceArgs extends BaseCallParameters {
  token: string
  account: string
}

export interface TokenAllowanceArgs extends BaseCallParameters {
  token: string
  owner: string
  spender: string
}

export interface ApproveTokenTransactionParameters extends BaseTransactionParameters {
  token: string
  spender: string
  amount: BigNumber
}

export function tokenBalance({ token, account, networkId }: TokenBalanceArgs): Promise<BigNumber> {
  const rpcProvider = getRpcProvider(networkId)
  if (token === 'ETH') {
    return rpcProvider.getBalance(account).then((result) => {
      return amountFromWei(new BigNumber(result.toString()), token)
    })
  }
  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  const { tokens } = contracts

  const contract = Erc20__factory.connect(tokens[token].address, rpcProvider)
  return contract.balanceOf(account).then((result) => {
    return amountFromWei(new BigNumber(result.toString()), token)
  })
}

export async function tokenAllowance({
  owner,
  spender,
  token,
  networkId,
}: TokenAllowanceArgs): Promise<BigNumber> {
  const rpcProvider = getRpcProvider(networkId)
  if (token === 'ETH') {
    return Promise.resolve(maxUint256)
  }

  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  const { tokens } = contracts

  const tokenAddress = tokens[token]?.address ?? safeGetAddress(token)

  if (!tokenAddress) {
    throw new Error(`Token address not found for token: ${token}`)
  }

  const contract = Erc20__factory.connect(tokenAddress, rpcProvider)

  // Reading decimals from chain instead of local config because of oracless mode.
  // amountFromWei uses local config to determine token precision which doesn't have all tokens defined
  const decimals = await contract.decimals()
  const allowance = await contract.allowance(owner, spender)

  return amountFromWei(new BigNumber(allowance.toString()), decimals)
}

export async function createApproveTransaction({
  token,
  networkId,
  signer,
  spender,
  amount,
}: ApproveTokenTransactionParameters): Promise<ethers.ContractTransaction> {
  const signerChainId = await signer.getChainId()
  if (signerChainId !== networkId) {
    const signerNetworkConfig = networkSetById[signerChainId]
    if (
      signerNetworkConfig?.isCustomFork &&
      networkId === signerNetworkConfig.getParentNetwork()?.id
    ) {
      console.info(`Using custom fork for the transaction. Network: ${networkId}`)
    } else {
      throw new Error(
        `Signer is on a different network than the one specified. Signer: ${signerChainId}. Network: ${networkId}`,
      )
    }
  }
  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  const { tokens } = contracts

  const tokenAddress = tokens[token]?.address ?? safeGetAddress(token)

  if (!tokenAddress) {
    throw new Error(`Token address not found for token: ${token}`)
  }

  const contract = Erc20__factory.connect(tokenAddress, signer)

  // Reading decimals from chain instead of local config because of oracless mode.
  // amountFromWei uses local config to determine token precision which doesn't have all tokens defined
  const decimals = await contract.decimals()

  const ethersAmount = amount.eq(maxUint256)
    ? ethers.constants.MaxUint256
    : ethers.BigNumber.from(amountToWei(amount, decimals).toString())

  return await contract.approve(spender, ethersAmount)
}

export async function createDisapproveTransaction({
  token,
  networkId,
  signer,
  spender,
}: ApproveTokenTransactionParameters): Promise<ethers.ContractTransaction> {
  const signerChainId = await signer.getChainId()
  if (signerChainId !== networkId) {
    const signerNetworkConfig = networkSetById[signerChainId]
    if (
      signerNetworkConfig?.isCustomFork &&
      networkId === signerNetworkConfig.getParentNetwork()?.id
    ) {
      console.info(`Using custom fork for the transaction. Network: ${networkId}`)
    } else {
      throw new Error(
        `Signer is on a different network than the one specified. Signer: ${signerChainId}. Network: ${networkId}`,
      )
    }
  }
  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  const { tokens } = contracts

  const contract = Erc20__factory.connect(tokens[token].address, signer)
  return await contract.approve(spender, 0)
}

export async function encodeTransferToOwnerProxyAction({
  networkId,
  token,
  amount,
  dpmAccount,
}: {
  networkId: NetworkIds
  amount: BigNumber
  token: string
  dpmAccount: string
}): Promise<OmniTxData> {
  const contracts = getNetworkContracts(networkId)

  ensureContractsExist(networkId, contracts, ['erc20ProxyActions'])
  ensureGivenTokensExist(networkId, contracts, [token])

  const { erc20ProxyActions, tokens } = contracts

  const tokenAddress = tokens[token].address

  const proxyActionContract = Erc20ProxyActions__factory.connect(
    erc20ProxyActions.address,
    getRpcProvider(networkId),
  )

  const dpmContract = AccountImplementation__factory.connect(dpmAccount, getRpcProvider(networkId))

  const owner = await dpmContract.owner()

  const amountInWei = amountToWei(amount, token).toFixed()

  const encodeFunctionData = proxyActionContract.interface.encodeFunctionData('transfer', [
    tokenAddress,
    owner,
    ethers.BigNumber.from(amountInWei),
  ])

  return {
    to: erc20ProxyActions.address,
    data: encodeFunctionData,
    value: '0',
  }
}

/**
 * Encodes a transaction to approve and wrap an ERC20 token using OpenZeppelin's ERC20Wrapper pattern.
 * This function prepares a transaction that will:
 * 1. Approve the wrapper contract to spend the old token
 * 2. Deposit the old token into the wrapper contract ( from proxy)
 * 3.Send the new wrapped token to the owner
 *
 * The wrapper contract must implement the IERC20Wrapper interface which includes:
 * - depositFor(address account, uint256 value)
 * - withdrawTo(address account, uint256 value)
 *
 * @param {object} params - The parameters object
 * @param {NetworkIds} params.networkId - The network ID where the transaction will be executed
 * @param {string} params.oldToken - The symbol of the token to be wrapped (underlying token)
 * @param {string} params.newToken - The symbol of the wrapped token to receive
 * @param {string} params.wrapper - The address of the ERC20Wrapper contract
 * @param {BigNumber} params.amount - The amount of tokens to wrap
 * @returns {Promise<OmniTxData>} The encoded transaction data ready to be executed
 * @throws Will throw if the contracts or tokens don't exist in the network configuration
 * @throws Will throw if the token addresses cannot be resolved
 */
export async function encodeApproveAndWrapProxyAction({
  networkId,
  oldToken,
  newToken,
  wrapper,
  amount,
}: {
  networkId: NetworkIds
  oldToken: string
  newToken: string
  wrapper: string
  amount: BigNumber
}): Promise<OmniTxData> {
  const contracts = getNetworkContracts(networkId)

  ensureContractsExist(networkId, contracts, ['erc20ProxyActions'])
  ensureGivenTokensExist(networkId, contracts, [oldToken, newToken])

  const { erc20ProxyActions, tokens } = contracts

  const oldTokenAddress = tokens[oldToken].address
  const newTokenAddress = tokens[newToken].address

  const proxyActionContract = Erc20ProxyActions__factory.connect(
    erc20ProxyActions.address,
    getRpcProvider(networkId),
  )

  const amountInWei = amountToWei(amount, oldToken).toFixed()

  const encodeFunctionData = proxyActionContract.interface.encodeFunctionData('approveAndWrap', [
    oldTokenAddress,
    newTokenAddress,
    wrapper,
    ethers.BigNumber.from(amountInWei),
  ])

  return {
    to: erc20ProxyActions.address,
    data: encodeFunctionData,
    value: '0',
  }
}
