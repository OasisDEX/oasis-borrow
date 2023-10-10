import type { TranslatableType } from 'components/Translatable.types'

export interface AssetsTableTooltipProps {
  content: {
    title?: TranslatableType
    description: TranslatableType
  }
  icon: string
  iconColor?: string
}
