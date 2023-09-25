import type { ReactNode } from 'react'

export interface AssetsTableBannerProps {
  cta: string
  description: string
  icon: JSX.Element
  link: string
  title: string
  onClick?: (link: string) => void
}

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
export interface AssetsTableRowData {
  [key: string]: AssetsTableCell
}

export interface AssetsTableProps {
  banner?: AssetsTableBannerProps
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isLoading?: boolean
  isSticky?: boolean
  rows: AssetsTableRowData[]
  tooltips?: string[]
}
