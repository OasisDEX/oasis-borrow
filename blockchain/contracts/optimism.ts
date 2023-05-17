import { ADDRESSES } from '@oasisdex/addresses'
import * as aaveV3Oracle from 'blockchain/abi/aave-v3-oracle.json'
import * as aaveV3PoolDataProvider from 'blockchain/abi/aave-v3-pool-data-provider.json'
import * as aaveV3Pool from 'blockchain/abi/aave-v3-pool.json'
import * as accountFactory from 'blockchain/abi/account-factory.json'
import * as accountGuard from 'blockchain/abi/account-guard.json'
import * as chainLinkPriceOracle from 'blockchain/abi/chainlink-price-oracle.json'
import * as operationExecutor from 'blockchain/abi/operation-executor.json'
import { contractDesc } from 'blockchain/networksConfig'
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
    USDCUSD: contractDesc(chainLinkPriceOracle, '0x16a9fa2fda030272ce99b29cf780dfa30361e0f3'),
    ETHUSD: contractDesc(chainLinkPriceOracle, '0x13e3Ee699D1909E989722E753853AE30b17e08c5'),
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
