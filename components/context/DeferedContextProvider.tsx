import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import type { PropsWithChildren } from 'react'
import React, { useContext } from 'react'

// usable in situations where ProductContext and other context is rendered simultanously:
//  <AaveContextProvider>
//    <DeferedContextProvider context={aaveContext}>
// it wont render children until needed context is available
// in my case the loader is not even visible, so I guess it was just a single render problem

export function DeferedContextProvider({
  children,
  context,
}: PropsWithChildren<{ context: React.Context<any> }>) {
  return useContext(context) ? <>{children}</> : <AppSpinnerWholePage />
}
