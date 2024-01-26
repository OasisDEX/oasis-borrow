import type { marketingTemplatesIcons } from 'features/marketing-layouts/icons'
import type {
  ProductFinderPromoCardFilters,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import type { ReactNode } from 'react'

export type IconWithPaletteContents = (params: MarketingTemplateIconPalette) => ReactNode

export interface MarketingTemplateIconPalette {
  backgroundGradient: [string, string, ...string[]]
  foregroundGradient: [string, string, ...string[]]
  symbolGradient: [string, string, ...string[]]
}

export interface MarketingTemplatePalette {
  mainGradient: [string, string, ...string[]]
  icon: MarketingTemplateIconPalette
}

export interface MarketingTemplateHeroProps {
  description: string
  image: string
  link: {
    url: string
    label: string
  }
  protocol: LendingProtocol
  title: string
}

export interface MarketingTemplateProductsProps {
  actionsList?: {
    icon: keyof typeof marketingTemplatesIcons
    label: string
    description?: string
  }[]
  composition: 'narrow' | 'wide'
  description: string
  image?: string
  link?: {
    url: string
    label: string
  }
  title: string
  type: string
}

export interface MarketingTemplateBenefitBoxProps {
  description?: string
  icon: keyof typeof marketingTemplatesIcons
  list?: string[]
  title: string
}

export interface MarketingTemplatePageProps {
  benefits: MarketingTemplateBenefitBoxProps[]
  benefitsSubtitle: string
  benefitsTitle: string
  hero: MarketingTemplateHeroProps
  palette: MarketingTemplatePalette
  productFinder: {
    initialNetwork?: ProductHubSupportedNetworks[]
    initialProtocol?: LendingProtocol[]
    product: ProductHubProductType
    token?: string
    promoCards: [
      ProductFinderPromoCardFilters,
      ProductFinderPromoCardFilters,
      ProductFinderPromoCardFilters,
    ]
  }
  products: MarketingTemplateProductsProps[]
  productsTitle: string
}
