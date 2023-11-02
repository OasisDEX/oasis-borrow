import { isMainContextAvailable, useMainContext } from 'components/context/MainContextProvider'
import type { PropsWithChildren } from 'react'
import React from 'react'

function SetupWeb3ContextInternal({ children }: PropsWithChildren<{}>) {
  const { setupWeb3Context$ } = useMainContext()
  setupWeb3Context$()

  return <>{children}</>
}

export function SetupWeb3Context({ children }: PropsWithChildren<{}>) {
  if (isMainContextAvailable()) {
    return <SetupWeb3ContextInternal>{children}</SetupWeb3ContextInternal>
  }

  return <>{children}</>
}
