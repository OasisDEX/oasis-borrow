import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'

import { DeferedContextProvider } from './DeferedContextProvider'
import { tosContext, TOSContextProvider } from './TOSContextProvider'

export const FunctionalContextHandler = ({ children }: WithChildren) => {
  // theese are needed on rewards/discover, which is sort of between open/manage and static pages
  return (
    <TOSContextProvider>
      <DeferedContextProvider context={tosContext}>{children}</DeferedContextProvider>
    </TOSContextProvider>
  )
}
