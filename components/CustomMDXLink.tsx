import React from 'react'

import { AppLink } from './Links'
import type { AppLinkProps } from './Links.types'

export function CustomMDXLink(props: AppLinkProps) {
  return <AppLink {...props} />
}
