import { useAppContext } from 'components/AppContextProvider'
import { useVaultCount } from 'components/Header'
import { Navigation } from 'components/navigation/Navigation'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { ajnaExtensionTheme, theme } from 'theme'
import { Spinner } from 'theme-ui'

export function AjnaNavigationController() {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const vaultCount = useVaultCount()

  const isConnected = context?.status === 'connected'

  return (
    <Navigation
      panels={[
        {
          description: 'Borrow against your favorite crypto assets.',
          label: 'Borrow',
          learn: {
            label: 'Learn more about Borrow',
            link: 'https://kb.oasis.app/',
          },
          links: [],
        },
        {
          description: 'Multiply your exposure to your favorite crypto assets.',
          label: 'Multiply',
          learn: {
            label: 'Learn more about Multiply',
            link: 'https://kb.oasis.app/',
          },
          links: [],
        },
      ]}
      links={[
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
                label: (
                  <>
                    My positions (
                    {vaultCount !== null ? (
                      vaultCount
                    ) : (
                      <Spinner
                        size={14}
                        color={ajnaExtensionTheme.colors.neutral80}
                        sx={{ verticalAlign: 'text-bottom' }}
                      />
                    )}
                    )
                  </>
                ),
                link: '/my',
              },
            ]
          : []),
      ]}
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
    />
  )
}
