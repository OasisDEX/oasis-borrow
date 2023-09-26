import type { BoxProps, ThemeUICSSObject, ThemeUIStyleObject } from 'theme-ui'

export interface IconProps extends BoxProps {
  color?: string
  role?: 'presentation'
  focusable?: boolean
  sx?: ThemeUIStyleObject
  icon: {
    path: JSX.Element
    viewBox?: string
  }
  width?: ThemeUICSSObject['width']
  height?: ThemeUICSSObject['width']
  size?: ThemeUICSSObject['width']
}
