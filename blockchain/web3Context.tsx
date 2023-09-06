import React from 'react'
import { isMainContextAvailable, useMainContext } from 'components/context'
import { WithChildren } from 'helpers/types'

function SetupWeb3ContextInternal({ children }: WithChildren) {
  const { setupWeb3Context$ } = useMainContext()

  setupWeb3Context$()

  return children
}

export function SetupWeb3Context({ children }: WithChildren) {
  if (isMainContextAvailable()) {
    return <SetupWeb3ContextInternal>{children}</SetupWeb3ContextInternal>
  }

  return children
}
