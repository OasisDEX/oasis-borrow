import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import type { Theme } from 'theme-ui'

export interface OmniContentCardCommonProps {
  changeVariant?: ChangeVariantType
  isLoading?: boolean
  modalTheme?: Theme
}
