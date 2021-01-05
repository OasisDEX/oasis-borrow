import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React from 'react'

function SetupWeb3ContextInternal({ children }: WithChildren) {
  const { setupWeb3Context$ } = useAppContext()
  setupWeb3Context$()
  return children
}

export function SetupWeb3Context({ children }: WithChildren) {
  if (isAppContextAvailable()) {
    return <SetupWeb3ContextInternal>{children}</SetupWeb3ContextInternal>
  }
  return children
}
