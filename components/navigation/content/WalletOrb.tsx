import { useAccountContext, useMainContext } from 'components/context'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { UserSettings, UserSettingsButtonContents } from 'features/userSettings/UserSettingsView'
import type { ContextAccountDetails } from 'helpers/functions'
import { getShowHeaderSettings } from 'helpers/functions'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

export function WalletOrb() {
  const { context$ } = useMainContext()
  const { accountData$ } = useAccountContext()
  const [accountData] = useObservable(accountData$)
  const [context] = useObservable(context$)

  const contextAccountDetails: ContextAccountDetails = { context, accountData }

  const showHeaderSettings = getShowHeaderSettings(contextAccountDetails)

  return (
    <>
      {showHeaderSettings && (
        <NavigationOrb
          icon="exchange"
          iconSize={20}
          customIcon={(isOpen) => (
            <UserSettingsButtonContents
              accountData={contextAccountDetails.accountData}
              active={isOpen}
              context={contextAccountDetails.context}
            />
          )}
        >
          {() => <UserSettings sx={{ p: 4, minWidth: '380px' }} />}
        </NavigationOrb>
      )}
    </>
  )
}
