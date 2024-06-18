import type { ProductHubColumnKey } from 'features/productHub/types'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { FeaturesEnum } from 'types/config'

export const refinanceProductHubHiddenColumns: ProductHubColumnKey[] = [
  'automation',
  '7DayNetApy',
  'action',
]
export const refinanceProductHubItemsPerPage = 5

export const refinanceMakerSteps = [
  RefinanceSidebarStep.Option,
  RefinanceSidebarStep.Strategy,
  RefinanceSidebarStep.Dpm,
  RefinanceSidebarStep.Import,
  RefinanceSidebarStep.Changes,
]

export const refinanceStepsWithoutDpm = [
  RefinanceSidebarStep.Option,
  RefinanceSidebarStep.Strategy,
  RefinanceSidebarStep.Changes,
]

export const refinanceCustomProductHubFiltersOptions = {
  [LendingProtocol.Maker]: {
    protocols: [
      {
        label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
        value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
        image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
      },
      {
        label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
        value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
        image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
        featureFlag: FeaturesEnum.MorphoBlue,
      },
      {
        label: lendingProtocolsByName[LendingProtocol.SparkV3].label,
        value: lendingProtocolsByName[LendingProtocol.SparkV3].name,
        image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
      },
    ],
  },
  [LendingProtocol.AaveV3]: {
    protocols: [
      {
        label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
        value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
        image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
        featureFlag: FeaturesEnum.MorphoBlue,
      },
      {
        label: lendingProtocolsByName[LendingProtocol.SparkV3].label,
        value: lendingProtocolsByName[LendingProtocol.SparkV3].name,
        image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
      },
    ],
  },

  [LendingProtocol.SparkV3]: {
    protocols: [
      {
        label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
        value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
        image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
      },
      {
        label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
        value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
        image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
        featureFlag: FeaturesEnum.MorphoBlue,
      },
    ],
  },
  [LendingProtocol.MorphoBlue]: {
    protocols: [
      {
        label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
        value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
        image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
      },
      {
        label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
        value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
        image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
        featureFlag: FeaturesEnum.MorphoBlue,
      },
      {
        label: lendingProtocolsByName[LendingProtocol.SparkV3].label,
        value: lendingProtocolsByName[LendingProtocol.SparkV3].name,
        image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
      },
    ],
  },
  [LendingProtocol.AaveV2]: undefined,
  [LendingProtocol.Ajna]: undefined,
}
