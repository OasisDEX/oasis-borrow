import { networksByName } from 'blockchain/networks'
import {
  AaveManageHeader,
  AaveMultiplyManageComponent,
  AaveOpenHeader,
  adjustRiskView,
} from 'features/aave/components'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import { adjustRiskSliders } from 'features/aave/services/riskSliderConfig'
import type { DepositTokensConfig } from 'features/aave/strategies/deposit-tokens-config-list'
import type { IStrategyConfig } from 'features/aave/types'
import { ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'
import { SparkEarnFaqV3 } from 'features/content/faqs/spark/earn'
import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import { getLocalAppConfig } from 'helpers/config'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

const getPositionInfo = (lendingeProtocol: LendingProtocol) => {
  switch (lendingeProtocol) {
    case LendingProtocol.SparkV3:
      return SparkEarnFaqV3
    case LendingProtocol.AaveV3:
      return AaveEarnFaqV3
    default:
      throw new Error('lending protocol case not implemented yat')
  }
}

export function parseLendingStrategies(
  tokensConfig: DepositTokensConfig[],
  networkName: ProductHubSupportedNetworks,
  lendingeProtocol: AaveLikeLendingProtocol,
): IStrategyConfig[] {
  return tokensConfig
    .filter(
      (config) =>
        config.protocol === lendingeProtocol && config.networkId === networksByName[networkName].id,
    )
    .flatMap((config) =>
      config.list.map((token) => {
        return {
          network: networkName,
          networkId: networksByName[networkName].id,
          networkHexId: networksByName[networkName].hexId,
          name: `deposit-${token.toLowerCase()}V3`,
          urlSlug: `${token.toLowerCase()}`,
          proxyType: ProxyType.DpmProxy,
          viewComponents: {
            headerOpen: AaveOpenHeader,
            headerManage: AaveManageHeader,
            headerView: AaveManageHeader,
            simulateSection: AaveMultiplyManageComponent,
            vaultDetailsManage: AaveMultiplyManageComponent,
            secondaryInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
            adjustRiskInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
            positionInfo: getPositionInfo(lendingeProtocol),
            sidebarTitle: 'open-multiply.sidebar.title',
            sidebarButton: 'open-multiply.sidebar.open-btn',
          },
          tokens: {
            deposit: token,
            collateral: token,
            debt: token,
          },
          riskRatios: adjustRiskSliders.empty,
          type: ProductType.Earn,
          protocol: lendingeProtocol,
          availableActions: () => {
            const additionalAction =
              config.additionalManageActions?.[token]
                ?.filter(({ featureToggle }) => {
                  const isFeatureEnabled =
                    featureToggle === undefined || getLocalAppConfig('features')[featureToggle]
                  return isFeatureEnabled
                })
                .map(({ action }) => action) ?? []
            return additionalAction
          },
          executeTransactionWith: 'ethers',
          defaultSlippage: config.defaultSlippage?.[token],
          strategyType: StrategyType.Long,
          featureToggle: config.featureToggle?.[token],
          isAutomationFeatureEnabled: () => false,
        }
      }),
    )
}
