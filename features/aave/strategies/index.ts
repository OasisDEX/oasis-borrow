import { RiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { isSupportedNetwork } from 'blockchain/networks'
import type { IStrategyConfig, ProductType } from 'features/aave/types'
import { isSupportedProductType } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { getLocalAppConfig } from 'helpers/config'
import { productToVaultType } from 'helpers/productToVaultType'
import { zero } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'
import { isLendingProtocol } from 'lendingProtocols'

import { arbitrumAaveV3Strategies } from './arbitrum-aave-v3-strategies'
import { baseAaveV3Strategies } from './base-aave-v3-strategies'
import { ethereumAaveV2Strategies } from './ethereum-aave-v2-strategies'
import { ethereumAaveV3Strategies } from './ethereum-aave-v3-strategies'
import { ethereumSparkV3Strategies } from './ethereum-spark-v3-strategies'
import { optimismAaveV3Strategies } from './optimism-aave-v3-strategies'

export const strategies = [
  ...ethereumAaveV2Strategies,
  ...optimismAaveV3Strategies,
  ...arbitrumAaveV3Strategies,
  ...ethereumAaveV3Strategies,
  ...ethereumSparkV3Strategies,
  ...baseAaveV3Strategies,
]

export function aaveStrategiesList(
  filterProduct?: IStrategyConfig['type'],
  filterProtocol?: IStrategyConfig['protocol'],
): IStrategyConfig[] {
  return Object.values(strategies)
    .filter(({ featureToggle }) =>
      featureToggle ? getLocalAppConfig('features')[featureToggle] : true,
    )
    .filter(({ type }) => (filterProduct ? type === filterProduct : true))
    .filter(({ protocol }) => (filterProtocol ? protocol === filterProtocol : true))
}

export function getAaveStrategy(strategyName: IStrategyConfig['name']) {
  return Object.values(strategies).filter(({ name }) => strategyName === name)
}

export function loadStrategyFromUrl(
  slug: string,
  protocol: string,
  positionType: string,
): IStrategyConfig {
  const strategy = strategies.find(
    (s) =>
      s.urlSlug.toUpperCase() === slug.toUpperCase() &&
      s.type.toUpperCase() === positionType.toUpperCase() &&
      s.protocol.toUpperCase() === protocol.toUpperCase(),
  )
  if (!strategy) {
    throw new Error(`Strategy not found for slug: ${slug}`)
  }
  return strategy
}

export function loadStrategyFromTokens(
  collateralToken: string,
  debtToken: string,
  networkName: NetworkNames,
  protocol: LendingProtocol,
  vaultType?: VaultType,
): IStrategyConfig {
  // Aave uses WETH gateway for ETH (we have ETH strategy specified)
  // so we have to convert that on the fly just to find the strategy
  // this is then converted back to WETH using wethToEthAddress
  const actualCollateralToken = collateralToken === 'WETH' ? 'ETH' : collateralToken
  const actualDebtToken = debtToken === 'WETH' ? 'ETH' : debtToken
  const strategy = strategies.find((s) => {
    /* Enhances for strategies to be filtered by product type */
    const matchesVaultType =
      vaultType === undefined ||
      vaultType === VaultType.Unknown ||
      vaultType === productToVaultType(s.type)
    return (
      s.tokens.collateral === actualCollateralToken &&
      s.tokens.debt === actualDebtToken &&
      s.network === networkName &&
      s.protocol === protocol &&
      matchesVaultType
    )
  })

  if (!strategy) {
    throw new Error(
      `Strategy not found for ${collateralToken}/${debtToken} (${actualCollateralToken}/${actualDebtToken}) for protocol: ${protocol} on network: ${networkName}`,
    )
  }
  return strategy
}

export function getSupportedTokens(protocol: LendingProtocol, network: NetworkNames): string[] {
  return Array.from(
    new Set(
      Object.values(strategies)
        .filter(({ protocol: p, network: n }) => p === protocol && n === network)
        .map((strategy) => Object.values(strategy.tokens))
        .flatMap((tokens) => tokens),
    ),
  )
}

export function isSupportedStrategy(
  network: string | NetworkNames,
  protocol: string | LendingProtocol,
  product: string | ProductType,
  strategy: string,
): [true, IStrategyConfig] | [false, undefined] {
  if (
    isSupportedNetwork(network) &&
    isLendingProtocol(protocol) &&
    isSupportedProductType(product)
  ) {
    const definedStrategy = strategies.find(
      (s) =>
        s.network === network &&
        s.protocol === protocol &&
        s.urlSlug.toLowerCase() === strategy.toLowerCase() &&
        s.type.toLowerCase() === product.toLowerCase(),
    )
    if (definedStrategy) {
      return [true, definedStrategy]
    } else {
      return [false, undefined]
    }
  }

  return [false, undefined]
}

export function getStrategyConfig(
  network: string | NetworkNames,
  protocol: string | LendingProtocol,
  product: string | ProductType,
  tokens: [string, string],
): IStrategyConfig | undefined {
  if (
    isSupportedNetwork(network) &&
    isLendingProtocol(protocol) &&
    isSupportedProductType(product)
  ) {
    return strategies.find(
      (s) =>
        s.network === network &&
        s.protocol === protocol &&
        s.tokens.collateral === tokens[0] &&
        s.tokens.debt === tokens[1] &&
        s.type.toLowerCase() === product.toLowerCase(),
    )
  }
  return undefined
}

export function convertDefaultRiskRatioToActualRiskRatio(
  defaultRiskRatio: IStrategyConfig['riskRatios']['default'],
  ltv?: BigNumber,
) {
  return defaultRiskRatio === 'slightlyLessThanMaxRisk'
    ? new RiskRatio(ltv?.times('0.99') || zero, RiskRatio.TYPE.LTV)
    : defaultRiskRatio
}
