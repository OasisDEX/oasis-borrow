import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

/**
 * Migration link should have following format:
 * [networkOrProduct]/aave/[version]/migrate/[address]
 * @returns string
 */
export const getMigrationLink = ({
  network,
  protocol,
  address,
}: {
  network: ProductHubSupportedNetworks
  protocol: LendingProtocol
  address: string
}) => {
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return `/${network}/aave/v3/migrate/${address}`

    case LendingProtocol.SparkV3:
      return `/${network}/spark/v3/migrate/${address}`

    default:
      return ''
  }
}
