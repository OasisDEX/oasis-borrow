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
    label: string
    url: string
  }
  protocol?: LendingProtocol | LendingProtocol[]
  title: string
  token?: string | string[]
}

export interface MarketingTemplateBlock {
  description?: string
  footer?: string
  subtitle?: string
  title?: string
}

export type MarketingProductFinderPromoCards = [
  ProductFinderPromoCardFilters,
  ProductFinderPromoCardFilters,
  ProductFinderPromoCardFilters,
]

interface MarketingTemplateProductFinderProps {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  product: ProductHubProductType
  promoCards: MarketingProductFinderPromoCards
  token?: string
}

export enum MarketingTemplateBlocks {
  PRODUCT_FINDER = 'product-finder',
  INFO_BOX = 'info-box',
  PRODUCT_BOX = 'product-box',
  BENEFIT_BOX = 'benefit-box',
  BANNER = 'banner',
  COMPARISON_TABLE = 'comparison-table',
}

export interface MarketingTemplateProductFinderBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.PRODUCT_FINDER
  content: MarketingTemplateProductFinderProps[]
}

export interface MarketingTemplateInfoBoxProps {
  description: string
  image: string
  link?: {
    label: string
    url: string
  }
  title: string
  tokens?: string[]
}

export interface MarketingTemplateInfoBoxBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.INFO_BOX
  content: MarketingTemplateInfoBoxProps[]
}

export type MarketingProductBoxComposition = 'narrow' | 'wide'

export interface MarketingTemplateProductBoxProps {
  actionsList?: {
    icon: string
    label: string
    description?: string
  }[]
  composition: MarketingProductBoxComposition
  description: string
  image?: string
  link?: {
    label: string
    url: string
  }
  title: string
  type: string
}

export interface MarketingTemplateProductBoxBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.PRODUCT_BOX
  content: MarketingTemplateProductBoxProps[]
}

export interface MarketingTemplateBenefitBoxProps {
  description: string
  icon: string
  title: string
}

export interface MarketingTemplateBenefitBoxBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.BENEFIT_BOX
  content: MarketingTemplateBenefitBoxProps[]
}

export interface MarketingTemplateBannerProps {
  cta: {
    label: string
    url: string
  }
  description?: string
  title: string
}

export interface MarketingTemplateBannerBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.BANNER
  content: MarketingTemplateBannerProps[]
}

export interface MarketingTemplateComparisonTableProps {
  body: (string | boolean)[][]
  header: string[]
}

export interface MarketingTemplateComparisonTableBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.COMPARISON_TABLE
  content: MarketingTemplateComparisonTableProps[]
}

export type MarketingTemplateProductFinderBlocks =
  | MarketingTemplateBannerBlock
  | MarketingTemplateBenefitBoxBlock
  | MarketingTemplateComparisonTableBlock
  | MarketingTemplateInfoBoxBlock
  | MarketingTemplateProductBoxBlock
  | MarketingTemplateProductFinderBlock

export interface MarketingTemplateFreeform {
  blocks: MarketingTemplateProductFinderBlocks[]
  hero: MarketingTemplateHeroProps
  palette: MarketingTemplatePalette
}
