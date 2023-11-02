import type { LinkProps } from 'next/dist/client/link'
import type React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'

export interface AppLinkProps extends LinkProps {
  disabled?: boolean
  hash?: string
  href: string
  internalInNewTab?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  query?: { [key: string]: string }
  sx?: ThemeUIStyleObject
  target?: string
  variant?: string
  withAccountPrefix?: boolean
}
