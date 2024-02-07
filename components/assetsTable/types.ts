import type { ActionBannerProps } from 'components/ActionBanner'
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

export interface AssetsTableRowItems {
  [key: string]: AssetsTableCell
}
export interface AssetsTableRowData {
  items: AssetsTableRowItems
  onClick?: () => void
}

export interface AssetsTableProps {
  banner?: ActionBannerProps
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isLoading?: boolean
  isSticky?: boolean
  rows: AssetsTableRowData[]
  tooltips?: string[]
}
