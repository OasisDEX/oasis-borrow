import type { ActionBannerProps } from 'components/ActionBanner'
import type { ProductHubItem } from 'features/productHub/types'
import type { ReactNode } from 'react'

export type AssetsTableSortingDirection = 'asc' | 'desc'

export interface AssetsTableSortingSettings {
  direction: AssetsTableSortingDirection
  key: string
}

export interface AssetsTableHeaderTranslationProps {
  [key: string]: string
}

export type AssetsTableCellContent = string | number | ReactNode

export interface AssetsTableSortableCell {
  value: AssetsTableCellContent
  sortable: string | number
}

export type AssetsTableCell = AssetsTableCellContent | AssetsTableSortableCell

export type AssetsTableSeparatorStatic = {
  index: number
  text?: string
}
export type AssetsTableSeparatorHandler = (
  table: ProductHubItem[],
) => AssetsTableSeparatorStatic | undefined
export type AssetsTableSeparator = AssetsTableSeparatorStatic | AssetsTableSeparatorHandler

export interface AssetsTableRowItems {
  [key: string]: AssetsTableCell
}
export interface AssetsTableRowData {
  isHighlighted?: boolean
  isStickied?: boolean
  items: AssetsTableRowItems
  link?: string
  onClick?: () => void
}

export interface AssetsTableProps {
  banner?: ActionBannerProps
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isLoading?: boolean
  isSticky?: boolean
  limitRows?: number
  paddless?: boolean
  perPage?: number
  rows: AssetsTableRowData[]
  separator?: AssetsTableSeparatorStatic
  tooltips?: string[]
  verticalAlign?: string
}
