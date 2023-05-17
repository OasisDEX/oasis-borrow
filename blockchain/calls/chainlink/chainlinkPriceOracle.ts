import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { MainnetContracts, mainnetContracts } from 'blockchain/contracts/mainnet'
import { NetworkIds } from 'blockchain/networkIds'
import { amountFromWei } from 'blockchain/utils'
import { getRpcProvider } from 'helpers/get-rpc-provider'
import { ChainlinkPriceOracle__factory } from 'types/ethers-contracts'

const USD_CHAINLINK_PRECISION = 8

export type ChainlinkSupportedNetworks = NetworkIds.MAINNET | NetworkIds.OPTIMISMMAINNET

const factory = ChainlinkPriceOracle__factory

export function getChainlinkOraclePrice(
  contractName: keyof MainnetContracts['chainlinkPriceOracle'],
  networkId: ChainlinkSupportedNetworks,
): Promise<BigNumber> {
  if (!contractName || !mainnetContracts['chainlinkPriceOracle'][contractName]) {
    throw new Error(`ChainlinkPriceOracle ${contractName} not found`)
  }

  const address = getNetworkContracts(networkId).chainlinkPriceOracle[contractName].address
  const contract = factory.connect(address, getRpcProvider(networkId))

  return contract.latestAnswer().then((result) => {
    return amountFromWei(new BigNumber(result.toString()), USD_CHAINLINK_PRECISION)
  })
}
