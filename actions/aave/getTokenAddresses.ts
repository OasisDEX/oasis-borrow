import { AAVEStrategyAddresses, AAVEV3StrategyAddresses } from '@oasisdex/oasis-actions'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { ethNullAddress } from 'blockchain/networksConfig'

export function getTokenAddresses(
  context: Context,
): AAVEStrategyAddresses & AAVEV3StrategyAddresses {
  const contracts = getNetworkContracts(context.chainId)
  return {
    DAI: contracts.tokens['DAI'].address,
    ETH: ethNullAddress,
    WETH: contracts.tokens['WETH'].address,
    STETH: contracts.tokens['STETH'].address,
    USDC: contracts.tokens['USDC'].address,
    WBTC: contracts.tokens['WBTC'].address,
    WSTETH: contracts.tokens['WSTETH'].address,
    chainlinkEthUsdPriceFeed: contracts.chainlinkPriceOracle['ETHUSD'].address,
    aaveProtocolDataProvider: contracts.aaveV3PoolDataProvider.address,
    pool: contracts.aaveV3Pool.address,
    aaveOracle: contracts.aaveV3Oracle.address,
    priceOracle: contracts.aaveV2PriceOracle.address,
    protocolDataProvider: contracts.aaveV2ProtocolDataProvider.address,
    lendingPool: contracts.aaveV2LendingPool.address,
    operationExecutor: contracts.operationExecutor.address,
  }
}
