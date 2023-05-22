import { ADDRESSES } from '@oasisdex/addresses'
import * as aaveV3Oracle from 'blockchain/abi/aave-v3-oracle.json'
import * as aaveV3PoolDataProvider from 'blockchain/abi/aave-v3-pool-data-provider.json'
import * as aaveV3Pool from 'blockchain/abi/aave-v3-pool.json'
import * as accountFactory from 'blockchain/abi/account-factory.json'
import * as accountGuard from 'blockchain/abi/account-guard.json'
import * as chainLinkPriceOracle from 'blockchain/abi/chainlink-price-oracle.json'
import * as operationExecutor from 'blockchain/abi/operation-executor.json'
import { contractDesc } from 'blockchain/networks'
import {
  AAVE_V3_POOL_GENESIS_MAINNET,
  ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
} from 'blockchain/tokens/mainnet'
import { tokensOptimism } from 'blockchain/tokens/optimism'

const { optimism } = ADDRESSES

export const optimismContracts = {
  tokens: tokensOptimism,
  tokensOptimism,
  chainlinkPriceOracle: {
    USDCUSD: contractDesc(chainLinkPriceOracle, optimism.common.ChainlinkPriceOracle_USDCUSD),
    ETHUSD: contractDesc(chainLinkPriceOracle, optimism.common.ChainlinkPriceOracle_ETHUSD),
  },
  operationExecutor: contractDesc(operationExecutor, optimism.mpa.core.OperationExecutor),
  swapAddress: optimism.mpa.core.Swap,
  accountFactory: contractDesc(
    accountFactory,
    optimism.mpa.core.AccountFactory,
    ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  ),
  accountGuard: contractDesc(
    accountGuard,
    optimism.mpa.core.AccountGuard,
    ACCOUNT_GUARD_FACTORY_GENESIS_MAINNET,
  ),
  aaveV3Pool: contractDesc(aaveV3Pool, optimism.aave.v3.Pool, AAVE_V3_POOL_GENESIS_MAINNET),
  aaveV3Oracle: contractDesc(aaveV3Oracle, optimism.aave.v3.AaveOracle),
  aaveV3PoolDataProvider: contractDesc(
    aaveV3PoolDataProvider,
    optimism.aave.v3.AavePoolDataProvider,
  ),
  safeConfirmations: 10,
  cacheApi: '',
}
