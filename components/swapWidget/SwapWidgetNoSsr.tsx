import dynamic from 'next/dynamic'

import { SwapWidgetSkeleton } from './SwapWidgetSkeleton'

export const SwapWidgetNoSsr = dynamic(
  () => {
    return import('./SwapWidget').then((component) => component.SwapWidget)
  },
  {
    ssr: false,
    loading: SwapWidgetSkeleton,
  },
)
