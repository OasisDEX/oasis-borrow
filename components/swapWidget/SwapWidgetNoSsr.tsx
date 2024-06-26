import dynamic from 'next/dynamic'

import { SwapWidgetSkeleton } from './SwapWidgetSkeleton'

export const SwapWidgetNoSsr = !process.env.NEXT_PUBLIC_SWAP_WIDGET_ONBOARDING_HIDDEN
  ? dynamic(
      () => {
        return import('./SwapWidget').then((component) => component.SwapWidget)
      },
      {
        ssr: false,
        loading: SwapWidgetSkeleton,
      },
    )
  : () => null
