import type { ReactNode } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'

export type BannerGradientPresetsArray = { [key: string]: [string, string] }
type BannerButtonProps = {
  disabled?: boolean
  isLoading?: boolean
  text?: string | ReactNode
  action: (() => void) | undefined
  sx?: ThemeUIStyleObject
}

export type BannerProps = {
  title: string | ReactNode
  description: ReactNode | ReactNode[]
  button?: BannerButtonProps
  image?: {
    src: string
    backgroundColor?: string
    backgroundColorEnd?: string
    spacing?: string | number
  }
  sx?: ThemeUIStyleObject
}
