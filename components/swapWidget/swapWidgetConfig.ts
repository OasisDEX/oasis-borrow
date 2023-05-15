import { WidgetConfig } from '@lifi/widget'
import { networks } from 'blockchain/networksConfig'
import { theme } from 'theme'

const { colors, radii } = theme

export const swapWidgetConfig: WidgetConfig = {
  integrator: 'Oasis.app',
  containerStyle: {
    border: 'none',
    height: '80%',
    maxHeight: '80%',
    // @ts-ignore
    '& > div': {
      maxHeight: '80%',
      height: '80%',
    },
  },
  appearance: 'light',
  variant: 'default',
  subvariant: 'split',
  theme: {
    palette: {
      background: {
        default: colors.neutral10,
        paper: colors.neutral10,
      },
      primary: {
        main: colors.primary100,
      },
    },
    shape: {
      borderRadius: radii.medium,
      borderRadiusSecondary: radii.round,
    },
  },
  hiddenUI: ['walletMenu', 'appearance', 'poweredBy', 'toAddress'],
  chains: {
    allow: networks.map((network) => network.id),
  },
}
