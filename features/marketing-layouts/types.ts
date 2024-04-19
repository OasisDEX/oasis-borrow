import { type Document as ContentfulDocument } from '@contentful/rich-text-types'
import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubFeaturedFilters, ProductHubFilters } from 'features/productHub/types'
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
  description?: ContentfulDocument
  footer?: ContentfulDocument
  subtitle?: string
  title?: string
}

interface MarketingTemplateProductFinderProps {
  featured?: ProductHubFeaturedFilters[]
  initialFilters?: ProductHubFilters
  product: OmniProductType
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
  description: ContentfulDocument
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
  contentImage?: string
  description?: ContentfulDocument
  image?: string
  link?: {
    label: string
    url: string
  }
  title: string
  type?: string
}

export interface MarketingTemplateProductBoxBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.PRODUCT_BOX
  content: MarketingTemplateProductBoxProps[]
}

export interface MarketingTemplateBenefitBoxProps {
  description: ContentfulDocument
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
  description?: ContentfulDocument
  title: string
}

export interface MarketingTemplateBannerBlock extends MarketingTemplateBlock {
  type: MarketingTemplateBlocks.BANNER
  content: MarketingTemplateBannerProps[]
}

export interface MarketingTemplateComparisonTableProps {
  body: (string | boolean)[][]
  header: string[]
  highlightedColumn?: number
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
  seoDescription: string
  seoTitle: string
}
