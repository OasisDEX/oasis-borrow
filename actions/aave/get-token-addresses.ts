import { AAVEStrategyAddresses, AAVEV3StrategyAddresses } from '@oasisdex/dma-library'
import {
  ensureChainlinkTokenPairsExist,
  ensureContractsExist,
  ensurePropertiesExist,
  ensureTokensExist,
  getNetworkContracts,
} from 'blockchain/contracts'
import { ethNullAddress, NetworkIds } from 'blockchain/networks'

export function getTokenAddresses(
  networkId: NetworkIds,
): AAVEV3StrategyAddresses & AAVEStrategyAddresses & { swapAddress: string } {
  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, [
    'aaveV3Pool',
    'operationExecutor',
    'aaveV3PoolDataProvider',
    'aaveV2LendingPool',
    'aaveV2PriceOracle',
    'aaveV2ProtocolDataProvider',
    'aaveV3Oracle',
  ])
  ensureTokensExist(networkId, contracts)
  ensureChainlinkTokenPairsExist(networkId, contracts, ['ETHUSD'])
  ensurePropertiesExist(networkId, contracts, ['swapAddress'])

  return {
    DAI: contracts.tokens['DAI'].address,
    ETH: ethNullAddress,
    WETH: contracts.tokens['WETH'].address,
    USDC: contracts.tokens['USDC'].address,
    WBTC: contracts.tokens['WBTC'].address,
    WSTETH: contracts.tokens['WSTETH'].address,
    CBETH: contracts.tokens['CBETH'].address,
    RETH: contracts.tokens['RETH'].address,
    STETH: contracts.tokens['STETH'].address,
    chainlinkEthUsdPriceFeed: contracts.chainlinkPriceOracle['ETHUSD'].address,
    pool: contracts.aaveV3Pool.address,
    aaveOracle: contracts.aaveV3Oracle.address,
    operationExecutor: contracts.operationExecutor.address,
    poolDataProvider: contracts.aaveV3PoolDataProvider.address,
    lendingPool: contracts.aaveV2LendingPool.address,
    priceOracle: contracts.aaveV2PriceOracle.address,
    protocolDataProvider: contracts.aaveV2ProtocolDataProvider.address,
    swapAddress: contracts.swapAddress,
  }
}
