import { WithChildren } from 'helpers/types'
import React from 'react'

import { appContext, AppContextProvider } from './AppContextProvider'
import { DeferedContextProvider } from './DeferedContextProvider'
import { tosContext, TOSContextProvider } from './TOSContextProvider'

export const PositionContextProvider = ({ children }: WithChildren) => {
  // theese are needed on the opening/managing positions page, but not on the static pages
  return (
    <TOSContextProvider>
      <DeferedContextProvider context={tosContext}>
        <AppContextProvider>
          <DeferedContextProvider context={appContext}>{children}</DeferedContextProvider>
        </AppContextProvider>
      </DeferedContextProvider>
    </TOSContextProvider>
  )
}
