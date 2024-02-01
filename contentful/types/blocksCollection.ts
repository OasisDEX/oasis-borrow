import {
  LendingPageBannerRawResponse,
  LendingPageBenefitBoxRawResponse,
  LendingPageComparisonTableRawResponse,
  LendingPageInfoBoxRawResponse,
  LendingPageProductBoxRawResponse,
  ProductFinderRawResponse,
} from './rawResponses'
import { type Document as ContentfulDocument } from '@contentful/rich-text-types'

export enum LandingPageRawBlocks {
  BANNER = 'LandingPageBanner',
  INFO_BOX = 'LandingPageInfoBox',
  BENEFIT_BOX = 'LandingPageBenefitBox',
  PRODUCT_BOX = 'LandingPageProductBox',
  PRODUCT_FINDER = 'ProductFinder',
  COMPARISON_TABLE = 'ComparisonTable',
}

type Base = {
  title?: string
  subtitle?: string
  description?: {
    json: ContentfulDocument
  }
  footer?: {
    json: ContentfulDocument
  }
}

export type LandingPageBenefit = Base & {
  type: LandingPageRawBlocks.BENEFIT_BOX
  collection: LendingPageBenefitBoxRawResponse[]
}

export type LandingPageInfo = Base & {
  type: LandingPageRawBlocks.INFO_BOX
  collection: LendingPageInfoBoxRawResponse[]
}

export type LandingPageProduct = Base & {
  type: LandingPageRawBlocks.PRODUCT_BOX
  collection: LendingPageProductBoxRawResponse[]
}

export type ProductFinder = Base & {
  type: LandingPageRawBlocks.PRODUCT_FINDER
  collection: ProductFinderRawResponse[]
}

export type LandingPageBanner = Base & {
  type: LandingPageRawBlocks.BANNER
  collection: LendingPageBannerRawResponse[]
}

export type LandingPageComparisonTable = Base & {
  type: LandingPageRawBlocks.COMPARISON_TABLE
  collection: LendingPageComparisonTableRawResponse[]
}

export type BlocksCollection =
  | LandingPageBenefit
  | LandingPageInfo
  | LandingPageProduct
  | ProductFinder
  | LandingPageBanner
  | LandingPageComparisonTable
