import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider } from 'blockchain/networks'
import { amountFromWei } from 'blockchain/utils'
import { ethers } from 'ethers'
import { Erc20__factory } from 'types/ethers-contracts'

import { BaseParameters } from './utils'

export interface TokenBalanceArgs extends BaseParameters {
  token: string
  account: string
}

export interface TokenAllowanceArgs extends BaseParameters {
  token: string
  owner: string
  spender: string
}

export interface BaseTransactionParameters extends BaseParameters {
  signer: ethers.Signer
}

export interface ApproveTokenTransactionParameters extends BaseTransactionParameters {
  token: string
  spender: string
  amount: BigNumber
}

export function tokenBalance({ token, account, networkId }: TokenBalanceArgs) {
  const rpcProvider = getRpcProvider(networkId)
  const tokenMappings = getNetworkContracts(networkId).tokens

  const contract = Erc20__factory.connect(tokenMappings[token].address, rpcProvider)
  return contract.balanceOf(account).then((result) => {
    return amountFromWei(new BigNumber(result.toString()), token)
  })
}

export function tokenAllowance({ owner, spender, token, networkId }: TokenAllowanceArgs) {
  const rpcProvider = getRpcProvider(networkId)
  const tokenMappings = getNetworkContracts(networkId).tokens

  const contract = Erc20__factory.connect(tokenMappings[token].address, rpcProvider)
  return contract.allowance(owner, spender).then((result) => {
    return amountFromWei(new BigNumber(result.toString()), token)
  })
}

export async function approve({
  token,
  networkId,
  signer,
  spender,
  amount,
}: ApproveTokenTransactionParameters): Promise<ethers.ContractReceipt> {
  if (networkId !== (await signer.getChainId())) {
    throw new Error('Network mismatch')
  }
  const tokenMappings = getNetworkContracts(networkId).tokens
  const confirmations = getNetworkContracts(networkId).safeConfirmations
  const contract = Erc20__factory.connect(tokenMappings[token].address, signer)

  const transaction = await contract.approve(spender, amount.toString(16))
  return await transaction.wait(confirmations)
}

export async function disapprove({
  token,
  networkId,
  signer,
  spender,
}: ApproveTokenTransactionParameters): Promise<ethers.ContractReceipt> {
  if (networkId !== (await signer.getChainId())) {
    throw new Error('Network mismatch')
  }
  const tokenMappings = getNetworkContracts(networkId).tokens
  const confirmations = getNetworkContracts(networkId).safeConfirmations
  const contract = Erc20__factory.connect(tokenMappings[token].address, signer)
  const transaction = await contract.approve(spender, 0)
  return await transaction.wait(confirmations)
}
