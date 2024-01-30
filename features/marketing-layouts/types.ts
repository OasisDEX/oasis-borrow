import type {
  ProductFinderPromoCardFilters,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'

export interface MarketingTemplatePalette {
  background: [string, string, ...string[]]
  foreground: [string, string, ...string[]]
}

export interface MarketingTemplateHeroProps {
  description: string
  image: string
  link: {
    url: string
    label: string
  }
  protocol?: LendingProtocol | LendingProtocol[]
  title: string
  token?: string | string[]
}

export interface MarketingTemplateBlock {
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

export interface MarketingTemplateProductBoxProps {
  actionsList?: {
    icon: string
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

interface MarketingTemplateProductBoxBlock extends MarketingTemplateBlock {
  type: 'product-box'
  content: MarketingTemplateProductBoxProps[]
}

export interface MarketingTemplateBenefitBoxProps {
  description: string
  icon: string
  title: string
}

interface MarketingTemplateBeneftBoxBlock extends MarketingTemplateBlock {
  type: 'benefit-box'
  content: MarketingTemplateBenefitBoxProps[]
}

export type MarketingTemplateProductFinderBlocks =
  | MarketingTemplateBeneftBoxBlock
  | MarketingTemplateInfoBoxBlock
  | MarketingTemplateProductBoxBlock
  | MarketingTemplateProductFinderBlock

export interface MarketingTemplateFreeform {
  blocks: MarketingTemplateProductFinderBlocks[]
  hero: MarketingTemplateHeroProps
  palette: MarketingTemplatePalette
}
