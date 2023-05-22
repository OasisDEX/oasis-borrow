import { AAVEV3StrategyAddresses } from '@oasisdex/dma-library'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networkIds'
import { ethNullAddress } from 'blockchain/networksConfig'

export function getTokenAddresses(networkId: NetworkIds.MAINNET): AAVEV3StrategyAddresses {
  const contracts = getNetworkContracts(networkId)
  return {
    DAI: contracts.tokens['DAI'].address,
    ETH: ethNullAddress,
    WETH: contracts.tokens['WETH'].address,
    USDC: contracts.tokens['USDC'].address,
    WBTC: contracts.tokens['WBTC'].address,
    WSTETH: contracts.tokens['WSTETH'].address,
    chainlinkEthUsdPriceFeed: contracts.chainlinkPriceOracle['ETHUSD'].address,
    pool: contracts.aaveV3Pool.address,
    aaveOracle: contracts.aaveV3Oracle.address,
    operationExecutor: contracts.operationExecutor.address,
    poolDataProvider: contracts.aaveV3PoolDataProvider.address,
  }
}
