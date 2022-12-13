import { useAppContext } from 'components/AppContextProvider'
import { Navigation } from 'components/navigation/Navigation'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

export function AjnaNavigationController() {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  const isConnected = context?.status === 'connected'

  return (
    <Navigation
      links={[
        {
          label: 'Borrow',
          link: '/borrow',
        },
        {
          label: 'Multiply',
          link: '/multiply',
        },
        {
          label: 'Earn',
          link: '/earn',
        },
        {
          label: 'Ajna Tokens',
          link: '/ajna/tokens',
        },
        ...(isConnected
          ? [
              {
                label: 'My position',
                link: '/my',
              },
            ]
          : []),
      ]}
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
    />
  )
}
