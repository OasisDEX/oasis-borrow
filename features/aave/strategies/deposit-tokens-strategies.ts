import { getNetworkById } from 'blockchain/networks'
import {
  AaveManageHeader,
  AaveMultiplyManageComponent,
  AaveOpenHeader,
  adjustRiskView,
} from 'features/aave/components'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import type { TokenDepositConfig } from 'features/aave/strategies/common'
import { depositTokensConfigList } from 'features/aave/strategies/deposit-tokens-config-list'
import type { IStrategyDepositConfig } from 'features/aave/types'
import { ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'

const availableTokenDeposits: TokenDepositConfig[] = depositTokensConfigList
  .map((depositTokensListConfig) => {
    return depositTokensListConfig.list
      .map((token) => [
        {
          protocol: depositTokensListConfig.protocol,
          networkId: depositTokensListConfig.networkId,
          deposit: token,
          strategyType: StrategyType.Long,
          productTypes: {
            [ProductType.Earn]: {
              featureToggle: depositTokensListConfig.featureToggle?.[token],
            },
          },
        },
      ])
      .flat()
  })
  .flat()

export const depositTokensStrategies: IStrategyDepositConfig[] = availableTokenDeposits.map(
  (config) => {
    const network = getNetworkById(config.networkId)
    return {
      network: network.name,
      networkId: config.networkId,
      networkHexId: network.hexId,
      name: `deposit-${config.deposit.toLowerCase()}V3`,
      urlSlug: `${config.deposit.toLowerCase()}`,
      proxyType: ProxyType.DpmProxy,
      viewComponents: {
        headerOpen: AaveOpenHeader,
        headerManage: AaveManageHeader,
        headerView: AaveManageHeader,
        simulateSection: AaveMultiplyManageComponent,
        vaultDetailsManage: AaveMultiplyManageComponent,
        secondaryInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        adjustRiskInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        positionInfo: AaveEarnFaqV3,
        sidebarTitle: 'open-multiply.sidebar.title',
        sidebarButton: 'open-multiply.sidebar.open-btn',
      },
      riskRatios: null,
      tokens: {
        deposit: config.deposit,
      },
      availableActions: () => [],
      type: ProductType.Earn,
      protocol: config.protocol,
      executeTransactionWith: 'ethers',
      strategyType: config.strategyType,
      isAutomationFeatureEnabled: () => false,
    }
  },
)
