import type { WithChildren } from 'helpers/types/With.types'

import type { marketingBackgrounds } from './backgrounds'

export interface MarketingLayoutProps extends WithChildren {
  variant?: string
  topBackground?: keyof typeof marketingBackgrounds
}
