import type { PositionSource } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { assertProtocol } from 'actions/aave-like/guards'
import { lendingProtocolToSystemKeys, networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import type { MigrateAaveLikeParameters } from 'actions/aave-like/types/migrate-aave-like-parameters'
import { getRpcProvider } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

export async function getMigrationPositionParameters({
  position,
  networkId,
  dpmAccount,
  sourceAddress,
  userAddress,
  protocol,
}: MigrateAaveLikeParameters) {
  assertProtocol(protocol)

  if (protocol === LendingProtocol.AaveV2) {
    throw new Error('Migration Aave V2 is not supported')
  }

  const strategyType = strategies.common.migrate

  type Args = Parameters<typeof strategyType>[0]
  type Deps = Parameters<typeof strategyType>[1]

  const { operationExecutor, erc20ProxyActions } = getAddresses(networkId, protocol)

  const systemKeyProtocol = lendingProtocolToSystemKeys(protocol)

  const args: Args = {
    collateralToken: position.collateral,
    debtToken: position.debt,
    positionSource:
      userAddress === sourceAddress ? ('eoa' as PositionSource) : ('dsProxy' as PositionSource),
    sourceAddress: sourceAddress,
    protocol: systemKeyProtocol,
  }

  const sharedDependencies: Deps = {
    proxy: dpmAccount,
    provider: getRpcProvider(networkId),
    user: userAddress,
    network: networkIdToLibraryNetwork(networkId),
    operationExecutor: operationExecutor,
    erc20ProxyActions: erc20ProxyActions,
  }

  let res
  try {
    res = await strategies.common.migrate(args, sharedDependencies)
  } catch (error) {
    console.error('Failed to get migration parameters', error)
    throw error
  }

  return res
}
