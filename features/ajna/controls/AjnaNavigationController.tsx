import { Navigation } from 'components/navigation/Navigation'
import React from 'react'

export function AjnaNavigationController() {
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
        {
          label: 'My position',
          link: '/my',
        },
      ]}
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
    />
  )
}
