import BigNumber from 'bignumber.js'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { ethers } from 'ethers'
import { AccountFactory__factory } from 'types/ethers-contracts'

import { GasMultiplier } from './utils'
import type { EstimatedGasResult } from './utils/types'

export interface CreateAccountParameters {
  networkId: NetworkIds
  signer: ethers.Signer
}

async function validateParameters({ signer, networkId }: CreateAccountParameters) {
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
  ensureContractsExist(networkId, contracts, ['accountFactory'])
  const { accountFactory } = contracts

  const accountFactoryContract = AccountFactory__factory.connect(accountFactory.address, signer)

  return { accountFactory: accountFactoryContract }
}

export async function estimateGasCreateAccount({
  networkId,
  signer,
}: CreateAccountParameters): Promise<EstimatedGasResult | undefined> {
  const { accountFactory } = await validateParameters({ signer, networkId })

  try {
    const transactionData = accountFactory.interface.encodeFunctionData('createAccount()')
    const result = await accountFactory.estimateGas['createAccount()']()
    return {
      estimatedGas: new BigNumber(result.toString()).multipliedBy(GasMultiplier).toFixed(0),
      transactionData,
    }
  } catch (e) {
    console.error(
      `Error estimating gas. Action: createAccount on factory: ${accountFactory.address}. Network: ${networkId}`,
      e,
    )
    return undefined
  }
}

export async function createCreateAccountTransaction({
  signer,
  networkId,
}: CreateAccountParameters): Promise<ethers.ContractTransaction> {
  const { accountFactory } = await validateParameters({ signer, networkId })

  const gasLimit = await estimateGasCreateAccount({ networkId, signer })

  return await accountFactory['createAccount()']({ gasLimit: gasLimit?.estimatedGas ?? 0 })
}

export function extractResultFromContractReceipt(receipt: ethers.ContractReceipt): UserDpmAccount {
  const event = receipt.events?.find((e) => e.event === 'AccountCreated')
  if (!event) {
    throw new Error('No AccountCreated event found in receipt')
  }
  const proxyAddress = event.args?.proxy
  if (!proxyAddress) {
    throw new Error('No proxy address found in AccountCreated event')
  }
  return {
    proxy: proxyAddress,
    user: event.args?.user,
    vaultId: event.args?.vaultId,
  }
}
