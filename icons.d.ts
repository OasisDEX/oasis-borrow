declare module '@makerdao/dai-ui-icons' {
  import { ComponentType } from 'react'
  export const Icon: ComponentType<{
    color?: string
    size?: number | string | number[]
    name: string
    width?: string | number
    height?: string | number
    onClick?(): void
  }>

  export const icons = {}
}

declare module '@makerdao/dai-ui-icons-branding' {
  import { ComponentType } from 'react'
  export const Icon: ComponentType<{
    color?: string
    size?: number | string | number[]
    name: string
    width?: string | number
    height?: string | number
    onClick?(): void
  }>

  export const icons = {}
}
