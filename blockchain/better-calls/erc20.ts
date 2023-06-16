import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { ensureTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, networkSetById } from 'blockchain/networks'
import { amountFromWei } from 'blockchain/utils'
import { ethers } from 'ethers'
import { Erc20__factory } from 'types/ethers-contracts'

import { BaseCallParameters, BaseTransactionParameters } from './utils'

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

export function tokenBalance({ token, account, networkId }: TokenBalanceArgs) {
  const rpcProvider = getRpcProvider(networkId)
  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  const { tokens } = contracts

  const contract = Erc20__factory.connect(tokens[token].address, rpcProvider)
  return contract.balanceOf(account).then((result) => {
    return amountFromWei(new BigNumber(result.toString()), token)
  })
}

export function tokenAllowance({ owner, spender, token, networkId }: TokenAllowanceArgs) {
  const rpcProvider = getRpcProvider(networkId)
  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  const { tokens } = contracts

  const contract = Erc20__factory.connect(tokens[token].address, rpcProvider)
  return contract.allowance(owner, spender).then((result) => {
    return amountFromWei(new BigNumber(result.toString()), token)
  })
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
      console.log(`Using custom fork for the transaction. Network: ${networkId}`)
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

  const ethersAmount = amount.eq(maxUint256)
    ? ethers.constants.MaxUint256
    : ethers.BigNumber.from(amount.toString())

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
      console.log(`Using custom fork for the transaction. Network: ${networkId}`)
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
