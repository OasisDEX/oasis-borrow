import { AaveLikeStrategyAddresses } from '@oasisdex/dma-library'
import {
  ensureChainlinkTokenPairsExist,
  ensureContractsExist,
  ensurePropertiesExist,
  ensureTokensExist,
  getNetworkContracts,
} from 'blockchain/contracts'
import { ethNullAddress, NetworkIds } from 'blockchain/networks'
import { AaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

export function getAddresses(
  networkId: NetworkIds,
  lendingProtocol: AaveLikeLendingProtocol,
): AaveLikeStrategyAddresses & { swapAddress: string } {
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

  const sharedAddresses = {
    tokens: {
      DAI: contracts.tokens['DAI'].address,
      ETH: ethNullAddress,
      WETH: contracts.tokens['WETH'].address,
      USDC: contracts.tokens['USDC'].address,
      WBTC: contracts.tokens['WBTC'].address,
      WSTETH: contracts.tokens['WSTETH'].address,
      CBETH: contracts.tokens['CBETH'].address,
      RETH: contracts.tokens['RETH'].address,
      STETH: contracts.tokens['STETH'].address,
      GHO: contracts.tokens['GHO'].address,
      USDT: contracts.tokens['USDT'].address,
      SDAI: contracts.tokens['SDAI'].address,
      LUSD: contracts.tokens['LUSD'].address,
      FRAX: contracts.tokens['FRAX'].address,
    },
    chainlinkEthUsdPriceFeed: contracts.chainlinkPriceOracle['ETHUSD'].address,
    operationExecutor: contracts.operationExecutor.address,
    swapAddress: contracts.swapAddress,
  }

  switch (lendingProtocol) {
    case LendingProtocol.AaveV2:
      return {
        ...sharedAddresses,
        lendingPool: contracts.aaveV2LendingPool.address,
        oracle: contracts.aaveV2PriceOracle.address,
        poolDataProvider: contracts.aaveV2ProtocolDataProvider.address,
      }
    case LendingProtocol.AaveV3:
      return {
        ...sharedAddresses,
        lendingPool: contracts.aaveV3Pool.address,
        oracle: contracts.aaveV3Oracle.address,
        poolDataProvider: contracts.aaveV3PoolDataProvider.address,
      }
    case LendingProtocol.SparkV3:
      throw new Error('Spark V3 not supported yet')
    // return {
    //   ...sharedAddresses,
    //   // TODO: Add Spark v3 sytem addresse
    //   // lendingPool: contracts.aaveV3Pool.address,
    //   // oracle: contracts.aaveV3Oracle.address,
    //   // poolDataProvider: contracts.aaveV3PoolDataProvider.address,
    // }
    default:
      throw new Error('Lending protocol not supported')
  }
}
