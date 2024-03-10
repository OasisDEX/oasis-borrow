import type { AaveLikeStrategyAddresses } from '@oasisdex/dma-library'
import {
  ensureChainlinkTokenPairsExist,
  ensureContractsExist,
  ensureGivenTokensExist,
  ensurePropertiesExist,
  getNetworkContracts,
} from 'blockchain/contracts'
import { ethNullAddress, NetworkIds } from 'blockchain/networks'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

export function getAddresses(
  networkId: NetworkIds,
  lendingProtocol: AaveLikeLendingProtocol,
): AaveLikeStrategyAddresses & { swapAddress: string } {
  const contracts = getNetworkContracts(networkId)
  // Spark V3 is mainnet only right now
  const contractProperties =
    networkId === NetworkIds.MAINNET
      ? [
          'aaveV3Pool',
          'operationExecutor',
          'aaveV3PoolDataProvider',
          'aaveV2LendingPool',
          'aaveV2PriceOracle',
          'aaveV2ProtocolDataProvider',
          'aaveV3Oracle',
          'sparkV3Pool',
          'sparkV3Oracle',
          'sparkV3PoolDataProvider',
        ]
      : [
          'aaveV3Pool',
          'operationExecutor',
          'aaveV3PoolDataProvider',
          'aaveV2LendingPool',
          'aaveV2PriceOracle',
          'aaveV2ProtocolDataProvider',
          'aaveV3Oracle',
        ]
  ensureContractsExist(networkId, contracts, contractProperties)
  ensureGivenTokensExist(networkId, contracts, [
    'DAI',
    'ETH',
    'WETH',
    'USDC',
    'WBTC',
    'WSTETH',
    'CBETH',
    'RETH',
    'STETH',
    'WEETH',
    'GHO',
    'USDT',
    'SDAI',
    'LUSD',
    'FRAX',
  ])
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
      WEETH: contracts.tokens['WEETH'].address,
    } as AaveLikeStrategyAddresses['tokens'],
    chainlinkEthUsdPriceFeed: contracts.chainlinkPriceOracle['ETHUSD'].address,
    operationExecutor: contracts.operationExecutor.address,
    swapAddress: contracts.swapAddress,
  }

  if (networkId === NetworkIds.BASEMAINNET) {
    sharedAddresses.tokens.USDBC = contracts.tokens['USDBC'].address
  }

  if (networkId === NetworkIds.OPTIMISMMAINNET || networkId === NetworkIds.ARBITRUMMAINNET) {
    sharedAddresses.tokens['USDC.E'] = contracts.tokens['USDC.E'].address
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
      return {
        ...sharedAddresses,
        lendingPool: contracts.sparkV3Pool.address,
        oracle: contracts.sparkV3Oracle.address,
        poolDataProvider: contracts.sparkV3PoolDataProvider.address,
      }
    default:
      throw new Error('Lending protocol not supported')
  }
}
