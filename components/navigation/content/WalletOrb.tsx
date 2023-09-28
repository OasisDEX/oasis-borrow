import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { UserSettings, UserSettingsButtonContents } from 'features/userSettings/UserSettingsView'
import type { ContextAccountDetails } from 'helpers/functions'
import { getShowHeaderSettings } from 'helpers/functions'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { exchange } from 'theme/icons'

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
          icon={exchange}
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
