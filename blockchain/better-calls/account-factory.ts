import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { ethers } from 'ethers'
import { AccountFactory__factory } from 'types/ethers-contracts'

export interface CreateAccountParameters {
  networkId: NetworkIds
  signer: ethers.Signer
}

async function validateParameters({ signer, networkId }: CreateAccountParameters) {
  const signerChainId = await signer.getChainId()
  if (signerChainId !== networkId) {
    throw new Error(
      `Signer is on a different network than the one specified. Signer: ${signerChainId}. Network: ${networkId}`,
    )
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
}: CreateAccountParameters): Promise<number | undefined> {
  const { accountFactory } = await validateParameters({ signer, networkId })

  try {
    const result = await accountFactory.estimateGas['createAccount()']()
    return result.toNumber()
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

  return await accountFactory['createAccount()']()
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
