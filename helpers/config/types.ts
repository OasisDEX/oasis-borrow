import type { ProductHubData } from 'features/productHub/types'
import type { AppConfigType, FeaturesEnum } from 'types/config'

export type ConfiguredFeatures = Record<FeaturesEnum, boolean>
export type ConfiguredAppParameters = AppConfigType['parameters']

export type ConfigResponseType = AppConfigType & {
  error?: string
}

export type ConfigResponseTypeKey = keyof ConfigResponseType

export type PreloadAppDataContext = {
  config: ConfigResponseType
  productHub: ProductHubData
}
