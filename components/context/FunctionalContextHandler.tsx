import React from 'react'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { tosContext, TOSContextProvider } from 'components/context/TOSContextProvider'
import { WithChildren } from 'helpers/types'

export const FunctionalContextHandler = ({ children }: WithChildren) => {
  // theese are needed on rewards/discover, which is sort of between open/manage and static pages
  return (
    <TOSContextProvider>
      <DeferedContextProvider context={tosContext}>{children}</DeferedContextProvider>
    </TOSContextProvider>
  )
}
