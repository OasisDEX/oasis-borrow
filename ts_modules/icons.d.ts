declare module '@makerdao/dai-ui-icons' {
  import type { ComponentType } from 'react'
  export const Icon: ComponentType<{
    color?: string
    size?: number | string | number[]
    name: string
    width?: string | number
    height?: string | number
    fill?: string
    sx?: import('theme-ui').ThemeUIStyleObject
    onClick?(): void
  }>

  export const icons = {}
}

declare module '@makerdao/dai-ui-icons-branding' {
  export const Icon: ComponentType<{
    color?: string
    size?: number | string | number[]
    name: string
    width?: string | number
    height?: string | number
    fill?: string
    sx?: import('theme-ui').ThemeUIStyleObject
    onClick?(): void
  }>

  export const icons = {}
}
