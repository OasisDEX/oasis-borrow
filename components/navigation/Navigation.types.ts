import type { IconProps } from 'components/Icon.types'
import type { ReactNode } from 'react'

export type NavigationModule = 'swap' | 'bridge'

export interface NavigationMenuPanelLink {
  icon: IconProps['icon']
  title: string
  link: string
  hash?: string
  footnote?: ReactNode
}

export interface NavigationMenuPanelIcon {
  icon?: IconProps['icon']
  image?: string
  tokens?: string[]
  position: 'global' | 'title'
}

export interface NavigationProps {
  actions?: ReactNode
  brandingLink?: string
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
  pill?: NavigationBrandingPill
}

export type NavigationBrandingPillColor = string | [string, string]

export interface NavigationBrandingPill {
  color: NavigationBrandingPillColor
  label: string
}

export interface NavigationBrandingProps {
  link?: string
  pill?: NavigationBrandingPill
}

interface NavigationMenuPanelLinkWithUrl {
  link: string
  onClick?: never
}

interface NavigationMenuPanelLinkWithAction {
  link?: never
  onClick: () => void
}

export type NavigationMenuPanelLinkType = (
  | NavigationMenuPanelLinkWithUrl
  | NavigationMenuPanelLinkWithAction
) & {
  label: ReactNode
}
export type NavigationMenuPanelLinkProps = NavigationMenuPanelLinkType & {
  onMouseEnter(): void
}
export interface NavigationMenuPanelAsset {
  token: string
  link: string
}

export interface NavigationMenuPanelLink {
  icon: IconProps['icon']
  title: string
  link: string
  hash?: string
  footnote?: ReactNode
}

export interface NavigationMenuPanelIcon {
  icon?: IconProps['icon']
  image?: string
  tokens?: string[]
  position: 'global' | 'title'
}

export type NavigationMenuPanelListTags = ([string, string] | string)[]

export interface NavigationMenuPanelList {
  header?: string
  items: NavigationMenuPanelListItem[]
  link?: {
    label: string
    query?: { [key: string]: string }
    url: string
  }
  tight?: boolean
}
export interface NavigationMenuPanelListItem {
  description?: ReactNode
  hoverColor?: string
  icon?: NavigationMenuPanelIcon
  list?: NavigationMenuPanelList
  navigationModule?: NavigationModule
  promoted?: boolean
  tags?: NavigationMenuPanelListTags
  title: ReactNode
  url?: string
}
export interface NavigationMenuPanelType {
  label: string
  lists: NavigationMenuPanelList[]
  alwaysVisibleNode?: ReactNode
  url?: string
}
export type NavigationMenuPanelProps = NavigationMenuPanelType & {
  currentPanel?: string
  isPanelOpen: boolean
  onMouseEnter(center: number): void
}
