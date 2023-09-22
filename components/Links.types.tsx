import type { WithChildren } from 'helpers/types/With.types'
import type { LinkProps } from 'next/dist/client/link'
import type React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'

export interface AppLinkProps extends WithChildren, LinkProps {
  disabled?: boolean
  href: string
  sx?: ThemeUIStyleObject
  variant?: string
  internalInNewTab?: boolean
  withAccountPrefix?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  target?: string
  hash?: string
}
