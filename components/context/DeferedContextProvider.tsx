import { AppSpinnerWholePage } from 'helpers/AppSpinner'
import { WithChildren } from 'helpers/types'
import React, { useContext } from 'react'

// usable in situations where AppContext and other context is rendered simultanously:
//  <AaveContextProvider>
//    <DeferedContextProvider context={aaveContext}>
// it wont render children until needed context is available
// in my case the loader is not even visible, so I guess it was just a single render problem

export function DeferedContextProvider({
  children,
  context,
}: WithChildren & { context: React.Context<any> }) {
  return useContext(context) ? children : <AppSpinnerWholePage />
}
