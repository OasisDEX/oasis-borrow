import type { WidgetConfig } from '@lifi/widget'
import { enableNetworksSet } from 'blockchain/networks'
import { theme } from 'theme'

const { colors, radii } = theme

export const swapWidgetConfig: WidgetConfig = {
  integrator: 'Summer.fi',
  containerStyle: {
    border: 'none',
    // @ts-ignore
    height: ['100%', '80%'],
    // @ts-ignore
    maxHeight: ['100%', '80%'],
    '& > div': {
      maxHeight: ['100%', '80%'],
      height: ['100%', '80%'],
    },
  },
  appearance: 'light',
  variant: 'default',
  subvariant: 'split',
  theme: {
    palette: {
      background: {
        default: colors?.neutral10 as string | undefined,
        paper: colors?.neutral10 as string | undefined,
      },
      primary: {
        main: colors?.primary100,
      },
    },
    shape: {
      borderRadius: (radii as any)?.medium as string,
      borderRadiusSecondary: (radii as any)?.round as string,
    },
  },
  hiddenUI: ['walletMenu', 'appearance', 'poweredBy', 'toAddress'],
  chains: {
    allow: enableNetworksSet.map((network) => network.id),
  },
  bridges: {
    deny: ['polygon', 'omni', 'gnosis', 'hyphen', 'multichain'],
  },
  fee: 0.002,
}
