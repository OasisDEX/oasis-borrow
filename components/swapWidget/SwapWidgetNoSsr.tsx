import { AppSpinner } from 'helpers/AppSpinner'
import dynamic from 'next/dynamic'

export const SwapWidgetNoSsr = dynamic(
  () => {
    return import('./SwapWidget').then((component) => component.SwapWidget)
  },
  { ssr: false, loading: () => <AppSpinner /> },
)
