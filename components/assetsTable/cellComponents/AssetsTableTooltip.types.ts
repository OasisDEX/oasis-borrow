import type { TranslatableType } from 'components/Translatable.types'
import type { ProductHubTooltipType } from 'features/productHub/content'

export interface AssetsTableTooltipProps {
  content: {
    title?: TranslatableType
    description: TranslatableType
  }
  icon: ProductHubTooltipType['icon']
  iconColor?: string
}
