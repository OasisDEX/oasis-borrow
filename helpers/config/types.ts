import type { ProductHubData } from 'features/productHub/types'
import type { AppConfigType, FeaturesEnum } from 'types/config'

export type ConfiguredFeatures = Record<FeaturesEnum, boolean>
export type ConfiguredAppParameters = AppConfigType['parameters']

export type AppConfigTypeKey = keyof AppConfigType

export type PreloadAppDataContext = {
  config: AppConfigType
  productHub: ProductHubData
}
