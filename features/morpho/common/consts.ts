import type { OmniFlow, OmniProductType, OmniSidebarStep } from 'features/omni-kit/types'

export const morphoSeoTags = {
  productKey: `seo.morphoProductPage.title`,
  descriptionKey: 'seo.morpho.description',
}

export const morphoOmniSteps: {
  [ProductKey in OmniProductType]: {
    [FlowKey in OmniFlow]: OmniSidebarStep[]
  }
} = {
  borrow: {
    open: ['setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction', 'transition'],
  },
  earn: {
    open: ['setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction', 'transition'],
  },
  multiply: {
    open: ['setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction'],
  },
}

export const morphoSupportedPairs = ['ETH-USDC', 'ETH-DAI', 'WSTETH-USDC']
