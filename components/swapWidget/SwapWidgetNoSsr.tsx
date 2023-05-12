import { AppSpinner } from 'helpers/AppSpinner'
import dynamic from 'next/dynamic'
import { Box } from 'theme-ui'

export const SwapWidgetNoSsr = dynamic(
  () => {
    return import('./SwapWidget').then((component) => component.SwapWidget)
  },
  {
    ssr: false,
    loading: () => (
      <Box sx={{ minWidth: '390px', pt: 5 }}>
        <AppSpinner size={40} />
      </Box>
    ),
  },
)
