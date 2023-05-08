import { ReactNode } from 'react'

export interface AssetsTableBannerProps {
  cta: string
  description: string
  icon: JSX.Element
  link: string
  title: string
  onClick?: (link: string) => void
}

export interface AssetsTableHeaderTranslationProps {
  [key: string]: string
}

export type AssetsTableRowData = {
  [key: string]: string | number | ReactNode
}

export interface AssetsTableProps {
  banner?: AssetsTableBannerProps
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isLoading?: boolean
  isSticky?: boolean
  isWithFollow?: boolean
  rows: AssetsTableRowData[]
  tooltips?: string[]
}

export interface AssetsTableFollowButtonProps {
  followerAddress: string
  chainId: number
}
