import { useAppContext } from 'components/AppContextProvider'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { UserSettings, UserSettingsButtonContents } from 'features/userSettings/UserSettingsView'
import { getShouldHideHeaderSettings } from 'helpers/functions'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

export function WalletOrb() {
  const { accountData$, context$, web3Context$ } = useAppContext()
  const [accountData] = useObservable(accountData$)
  const [context] = useObservable(context$)
  const [web3Context] = useObservable(web3Context$)

  const shouldHideSettings = getShouldHideHeaderSettings(context, accountData, web3Context)

  return (
    <>
      {!shouldHideSettings && (
        <NavigationOrb
          icon="exchange"
          iconSize={20}
          customIcon={(isOpen) => (
            <UserSettingsButtonContents
              accountData={accountData}
              active={isOpen}
              context={context}
              web3Context={web3Context}
            />
          )}
        >
          {() => <UserSettings sx={{ p: 4, minWidth: '380px' }} />}
        </NavigationOrb>
      )}
    </>
  )
}
