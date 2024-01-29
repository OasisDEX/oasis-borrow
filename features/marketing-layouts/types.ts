import type { marketingTemplatesIcons } from 'features/marketing-layouts/icons'
import type {
  ProductFinderPromoCardFilters,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'

export interface MarketingTemplateHeroProps {
  description: string
  image: string
  link: {
    url: string
    label: string
  }
  protocol?: LendingProtocol[]
  title: string
  token?: string[]
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

export interface MarketingTemplatePalette {
  background: [string, string, ...string[]]
  foreground: [string, string, ...string[]]
}

interface MarketingTemplateBlock {
  subtitle?: string
  title?: string
  description?: string
}

interface MarketingTemplateProductFinderProps {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  product: ProductHubProductType
  promoCards: [
    ProductFinderPromoCardFilters,
    ProductFinderPromoCardFilters,
    ProductFinderPromoCardFilters,
  ]
  token?: string
}

interface MarketingTemplateProductFinderBlock extends MarketingTemplateBlock {
  type: 'product-finder'
  content: MarketingTemplateProductFinderProps
}

export interface MarketingTemplateInfoBoxProps {
  description: string
  image: string
  link?: {
    url: string
    label: string
  }
  title: string
  tokens?: string[]
}

interface MarketingTemplateInfoBoxBlock extends MarketingTemplateBlock {
  type: 'info-box'
  content: MarketingTemplateInfoBoxProps[]
}

export type MarketingTemplateProductFinderBlocks =
  | MarketingTemplateProductFinderBlock
  | MarketingTemplateInfoBoxBlock

export interface MarketingTemplateFreeform {
  blocks: MarketingTemplateProductFinderBlocks[]
  hero: MarketingTemplateHeroProps
  palette: MarketingTemplatePalette
}
