import type { BoxProps, ThemeUIStyleObject } from 'theme-ui'

export interface IconProps extends BoxProps {
  color?: string
  role?: 'presentation'
  focusable?: boolean
  sx?: ThemeUIStyleObject
  icon: {
    path: JSX.Element
    viewBox?: string
  }
  width?: number | string
  height?: number | string
  size?: number | string
}
