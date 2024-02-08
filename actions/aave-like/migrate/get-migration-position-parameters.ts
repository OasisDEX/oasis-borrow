import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { assertProtocol } from 'actions/aave-like/guards'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import type { MigrateAaveLikeParameters } from 'actions/aave-like/types/migrate-aave-like-parameters'
import { ethNullAddress, getRpcProvider } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

export async function getMigrationPositionParameters({
  position,
  networkId,
  proxyAddress,
  userAddress,
  reserveData,
  protocol,
}: MigrateAaveLikeParameters) {
  assertProtocol(protocol)

  const network = networkIdToLibraryNetwork(networkId)

  if (protocol === LendingProtocol.AaveV2) {
    throw new Error('Migration Aave V2 is not supported')
  }

  const aaveLikeOpenStrategyType = {
    [LendingProtocol.AaveV3]: strategies.aave.migrate,
    [LendingProtocol.SparkV3]: strategies.spark.migrate,
  }[protocol]

  type AaveLikeOpenStrategyArgs = Parameters<typeof aaveLikeOpenStrategyType.fromEOA>[0]
  type AaveLikeOpenStrategyDeps = Parameters<typeof aaveLikeOpenStrategyType.fromEOA>[1]

  const args: AaveLikeOpenStrategyArgs = {
    vdToken: {
      address: reserveData.debt.variableDebtAddress,
    },
    aToken: {
      address: reserveData.collateral.tokenAddress,
      amount: position.collateral.amount,
    },
  }

  type SharedAaveLikeDependencies = Omit<AaveLikeOpenStrategyDeps, 'addresses' | 'protocolType'>
  const sharedDependencies: SharedAaveLikeDependencies = {
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? userAddress : ethNullAddress,
    network,
    currentPosition: position,
  }

  switch (protocol) {
    case LendingProtocol.AaveV3:
      const aavev3Addresses = getAddresses(networkId, LendingProtocol.AaveV3)
      const dependenciesAaveV3 = {
        ...sharedDependencies,
        addresses: aavev3Addresses,
        getSwapData: swapCall(aavev3Addresses, networkId),
        protocolType: 'AAVE_V3' as const,
      }
      return await strategies.aave.migrate.fromEOA(args, dependenciesAaveV3)
    case LendingProtocol.SparkV3:
      const sparkV3Addresses = getAddresses(networkId, LendingProtocol.SparkV3)
      const dependenciesSparkV3 = {
        ...sharedDependencies,
        addresses: sparkV3Addresses,
        getSwapData: swapCall(sparkV3Addresses, networkId),
        protocolType: 'Spark' as const,
      }
      return await strategies.spark.migrate.fromEOA(args, dependenciesSparkV3)
    default:
      throw new Error('Unsupported protocol')
  }
}
