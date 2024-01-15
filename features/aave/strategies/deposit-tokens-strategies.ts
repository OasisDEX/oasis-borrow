import { getNetworkById } from 'blockchain/networks'
import {
  AaveManageHeader,
  AaveMultiplyManageComponent,
  AaveOpenHeader,
  adjustRiskView,
} from 'features/aave/components'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import { adjustRiskSliders } from 'features/aave/services/riskSliderConfig'
import type { TokenDepositConfig } from 'features/aave/strategies/common'
import { depositTokensList } from 'features/aave/strategies/deposit-tokens-list'
import type { IStrategyConfig } from 'features/aave/types'
import { ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'

const availableTokenDeposits: TokenDepositConfig[] = depositTokensList
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
              featureToggle: undefined,
            },
          },
        },
      ])
      .flat()
  })
  .flat()

export const depositTokensStrategies: IStrategyConfig[] = availableTokenDeposits.map((config) => {
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
    tokens: {
      deposit: config.deposit,
      collateral: '',
      debt: '',
    },
    riskRatios: adjustRiskSliders.empty,
    availableActions: () => [],
    type: ProductType.Earn,
    protocol: config.protocol,
    executeTransactionWith: 'ethers',
    strategyType: config.strategyType,
    isAutomationFeatureEnabled: () => false,
  }
})
