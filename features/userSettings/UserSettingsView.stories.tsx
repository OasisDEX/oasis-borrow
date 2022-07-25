import { Web3Context } from '@oasisdex/web3-context'
import { storiesOf } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { ModalProvider } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import { Box, Container, Heading } from 'theme-ui'
import Web3 from 'web3'

import { SLIPPAGE_DEFAULT, SLIPPAGE_OPTIONS, UserSettingsState } from './userSettings'
import { UserSettings } from './UserSettingsView'

const stories = storiesOf('User settings', module)

const protoWeb3Context: Web3Context = {
  chainId: 42,
  status: 'connected',
  deactivate: () => null,
  account: '0xdA1810f583320Bd25BD30130fD5Db06591bEf915',
  connectionKind: 'injected',
  web3: {} as Web3,
}

const StoryContainer = ({ children, title }: { title: string } & WithChildren) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Heading variant="smallHeading" sx={{ mt: 5, mb: 3, textAlign: 'right' }}>
        {title}
      </Heading>
      <Box sx={{ bg: 'pink', p: 6 }}>
        <Box
          sx={{
            bg: 'neutral10',
            boxShadow: 'elevation',
            borderRadius: 'mediumLarge',
            width: '380px',
          }}
        >
          {children}
        </Box>
      </Box>
    </Container>
  )
}

const settings: UserSettingsState = {
  stage: 'editing',
  slippage: SLIPPAGE_DEFAULT,
  slippageInput: SLIPPAGE_DEFAULT,
  setSlippageInput: () => null,
  reset: () => null,
  canProgress: true,
  errors: [],
  warnings: [],
}

function MockContextProvider({
  children,
  title,
  userSettings,
}: {
  title: string
  userSettings: UserSettingsState
} & WithChildren) {
  const ctx = ({
    web3Context$: of(protoWeb3Context),
    userSettings$: of(userSettings),
    accountData$: of({ daiBalance: new BigNumber(1000) }),
  } as any) as AppContext

  return (
    <appContext.Provider value={ctx as any}>
      <ModalProvider>
        <StoryContainer {...{ title }}>{children}</StoryContainer>
      </ModalProvider>
    </appContext.Provider>
  )
}

stories.add('Editing start', () => {
  return (
    <MockContextProvider title="Editing start Slippage" userSettings={settings}>
      <UserSettings />
    </MockContextProvider>
  )
})

stories.add('Editing', () => {
  return (
    <MockContextProvider
      title="Editing Slippage"
      userSettings={{ ...settings, slippageInput: SLIPPAGE_OPTIONS[1] }}
    >
      <UserSettings />
    </MockContextProvider>
  )
})

stories.add('In progress', () => {
  return (
    <MockContextProvider title="In progress" userSettings={{ ...settings, stage: 'inProgress' }}>
      <UserSettings />
    </MockContextProvider>
  )
})

stories.add('Failure', () => {
  return (
    <MockContextProvider title="Failure" userSettings={{ ...settings, stage: 'failure' }}>
      <UserSettings />
    </MockContextProvider>
  )
})

stories.add('Success', () => {
  return (
    <MockContextProvider title="Success" userSettings={{ ...settings, stage: 'success' }}>
      <UserSettings />
    </MockContextProvider>
  )
})
