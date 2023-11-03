import type { PropsWithChildren } from 'react'

import type { marketingBackgrounds } from './backgrounds'

export interface MarketingLayoutProps extends PropsWithChildren<{}> {
  variant?: string
  topBackground?: keyof typeof marketingBackgrounds
}
