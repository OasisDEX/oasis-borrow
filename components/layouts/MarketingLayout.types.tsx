import type { PropsWithChildren } from 'react'

import type { marketingBackgrounds } from './backgrounds'

export interface MarketingLayoutProps extends PropsWithChildren<{}> {
  backgroundGradient?: string[]
  topBackground?: keyof typeof marketingBackgrounds
  variant?: string
}
