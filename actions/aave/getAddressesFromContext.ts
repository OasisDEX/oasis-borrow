import { AAVEStrategyAddresses, AAVEV3StrategyAddresses } from '@oasisdex/oasis-actions'
import { Context } from 'blockchain/network'
import { ethNullAddress } from 'blockchain/networksConfig'

export function getAddressesFromContext(
  context: Context,
): AAVEStrategyAddresses & AAVEV3StrategyAddresses {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: ethNullAddress,
    WETH: context.tokens['WETH'].address,
    STETH: context.tokens['STETH'].address,
    USDC: context.tokens['USDC'].address,
    WBTC: context.tokens['WBTC'].address,
    WSTETH: context.tokens['WSTETH'].address,
    chainlinkEthUsdPriceFeed: context.chainlinkPriceOracle['ETHUSD'].address,
    aaveProtocolDataProvider: context.aaveV3PoolDataProvider.address,
    pool: context.aaveV3Pool.address,
    aaveOracle: context.aaveV3Oracle.address,
    priceOracle: context.aaveV2PriceOracle.address,
    protocolDataProvider: context.aaveV2ProtocolDataProvider.address,
    lendingPool: context.aaveV2LendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }
}
