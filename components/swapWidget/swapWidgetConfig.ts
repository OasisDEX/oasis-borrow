import { WidgetConfig } from '@lifi/widget'
import { networks } from 'blockchain/networksConfig'
import { theme } from 'theme'

const { colors } = theme

// const widgetTheme: SwapWidgetTheme = {
//   accent: colors.primary100,
//   primary: colors.primary100,
//   container: colors.neutral10,
//   active: colors.primary100,
//   interactive: colors.neutral10,
//   module: colors.neutral30,
//   dialog: colors.neutral10,
//   success: colors.success10,
//   error: colors.critical10,
//   tokenColorExtraction: false,
//   borderRadius: {
//     small: radii.mediumLarge,
//     medium: radii.mediumLarge,
//     large: radii.mediumLarge,
//   },
//   fontFamily: 'Inter',
// }

export const swapWidgetConfig: WidgetConfig = {
  integrator: 'Oasis',
  containerStyle: {
    border: 'none',
  },
  appearance: 'light',
  theme: {
    palette: {
      background: {
        default: colors.neutral10,
        paper: colors.neutral10,
      },
    },
  },
  chains: {
    allow: networks.map((network) => network.id),
  },
}
