import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networkIds'
import { networksById } from 'blockchain/networksConfig'
import { ethers } from 'ethers'

export type Factory<T> = {
  connect: (address: string, rpcProvider: ethers.providers.Provider) => T
}

export type BaseParameters = {
  readonly networkId: NetworkIds.MAINNET
}

export type ContractForNetwork<Contract> = {
  readonly networkId: NetworkIds
  readonly address: string
  readonly contract: Contract
  readonly contractGenesis: number
  readonly tokenMappings: Record<string, { address: string }>
  readonly baseCurrencyUnit: BigNumber
}

const baseCurrencyUnits = {
  [NetworkIds.MAINNET]: new BigNumber(100000000),
}

export function getNetworkMapping<Contract>(
  factory: Factory<Contract>,
  networkId: NetworkIds.MAINNET,
): ContractForNetwork<Contract> {
  const { address, genesisBlock } = getNetworkContracts(networkId).aaveV3PoolDataProvider
  const rpcProvider = networksById[networkId].readProvider
  const tokenMappings = getNetworkContracts(networkId).tokens
  const contract = factory.connect(address, rpcProvider)

  return {
    networkId,
    address,
    contract,
    contractGenesis: genesisBlock,
    tokenMappings,
    baseCurrencyUnit: baseCurrencyUnits[networkId],
  }
}
