import { type NetworkNames, networksById } from 'blockchain/networks'
import type { ChainId, ProtocolId } from 'features/migrations/types'
import { LendingProtocolByProtocolId } from 'features/migrations/types'
import { LendingProtocol } from 'lendingProtocols'

/**
 * Migration link should have following format:
 * [networkOrProduct]/aave/[version]/migrate/[address]
 * @returns string
 */
export const getMigrationLink = ({
  address,
  ...rest
}: { address: string } & (
  | {
      chainId: ChainId
      protocolId: ProtocolId
    }
  | {
      network: NetworkNames
      protocol: LendingProtocol
    }
)) => {
  let lendingProtocol: LendingProtocol
  let networkName: NetworkNames

  if ('chainId' in rest && 'protocolId' in rest) {
    networkName = networksById[rest.chainId].name
    lendingProtocol = LendingProtocolByProtocolId[rest.protocolId]
  } else if ('network' in rest && 'protocol' in rest) {
    networkName = rest.network
    lendingProtocol = rest.protocol
  } else {
    throw new Error('Invalid arguments')
  }

  switch (lendingProtocol) {
    case LendingProtocol.AaveV3:
      return `/${networkName}/aave/v3/migrate/${address}`

    case LendingProtocol.SparkV3:
      return `/${networkName}/spark/v3/migrate/${address}`

    default:
      return ''
  }
}
