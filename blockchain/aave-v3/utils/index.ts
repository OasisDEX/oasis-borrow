import BigNumber from 'bignumber.js'
import { AaveV3SupportedNetwork } from 'blockchain/aave-v3/aave-v3-supported-network'
import { getNetworkContracts } from 'blockchain/contracts'
import { MainnetContracts } from 'blockchain/contracts/mainnet'
import { NetworkIds } from 'blockchain/networkIds'
import { networksById } from 'blockchain/networksConfig'
import { ethers } from 'ethers'

export type Factory<T> = {
  connect: (address: string, rpcProvider: ethers.providers.Provider) => T
}

export type BaseParameters = {
  readonly networkId: AaveV3SupportedNetwork
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
  [NetworkIds.HARDHAT]: new BigNumber(100000000),
}

type ContractKey = keyof Pick<
  MainnetContracts,
  'aaveV3PoolDataProvider' | 'aaveV3Pool' | 'aaveV3Oracle'
>

export function getNetworkMapping<Contract>(
  factory: Factory<Contract>,
  networkId: AaveV3SupportedNetwork,
  contractKey: ContractKey,
): ContractForNetwork<Contract> {
  const { address, genesisBlock } = getNetworkContracts(networkId)[contractKey]
  const rpcProvider =
    networksById[networkId]?.readProvider ?? networksById[NetworkIds.MAINNET].readProvider
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
