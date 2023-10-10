import BigNumber from 'bignumber.js'
import type { AllNetworksContractsType } from 'blockchain/contracts'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import type { SparkV3ReserveDataParameters } from 'blockchain/spark-v3/spark-v3-pool-data-provider'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3/spark-v3-supported-network'
import type { ethers } from 'ethers'

export type Factory<T> = {
  connect: (address: string, rpcProvider: ethers.providers.Provider) => T
}

export type BaseParameters = {
  readonly networkId: SparkV3SupportedNetwork
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
  [NetworkIds.OPTIMISMMAINNET]: new BigNumber(100000000),
  [NetworkIds.ARBITRUMMAINNET]: new BigNumber(100000000),
  [NetworkIds.HARDHAT]: new BigNumber(100000000),
}

type ContractKey = keyof Pick<
  AllNetworksContractsType[SparkV3SupportedNetwork],
  'sparkV3PoolDataProvider' | 'sparkV3Pool' | 'sparkV3Oracle'
>

export function getNetworkMapping<Contract>(
  factory: Factory<Contract>,
  networkId: SparkV3SupportedNetwork,
  contractKey: ContractKey,
): ContractForNetwork<Contract> {
  const { address, genesisBlock } = getNetworkContracts(networkId)[contractKey]
  const rpcProvider = getRpcProvider(networkId)
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

/**
 *  Spark (as Aave probably) expects WETH instead of ETH address, this handles it
 */
export function wethToEthAddress<T>(
  tokenMappings: ContractForNetwork<T>['tokenMappings'],
  token: SparkV3ReserveDataParameters['token'],
): string {
  return tokenMappings[token].address === tokenMappings['ETH'].address
    ? tokenMappings['WETH'].address
    : tokenMappings[token].address
}
