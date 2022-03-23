import { storiesOf } from '@storybook/react'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, Container, Heading } from 'theme-ui'
import { TxState } from '@oasisdex/transactions'
import { Web3Context } from '@oasisdex/web3-context'
import { AppContext } from 'components/AppContext'
import { TxData } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { AppHeader } from 'components/Header'
import { ModalProvider } from 'helpers/modalHook'
import { of } from 'rxjs'
import Web3 from 'web3'

import { SLIPPAGE_DEFAULT, SLIPPAGE_OPTIONS, UserSettingsState } from './userSettings'
import { UserSettings } from './UserSettingsView'
import BigNumber from 'bignumber.js'

const stories = storiesOf('User settings', module)


interface MockContextProviderProps extends WithChildren {
  web3Context: Web3Context
  title: string
  transactions?: TxState<TxData>[]
}

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
      {children}
    </Container>
  )
}

const BASE_PROPS: UserSettingsState & { opened: boolean; setOpened: () => void } = {
  stage: 'editing',
  slippage: SLIPPAGE_DEFAULT,
  slippageInput: SLIPPAGE_DEFAULT,
  setSlippageInput: () => null,
  reset: () => null,
  canProgress: true,
  errors: [],
  warnings: [],
  opened: false,
  setOpened: () => null,
}

const BASE_PROPS_CHANGED_VALUE: UserSettingsState & { opened: boolean; setOpened: () => void } = {
  ...BASE_PROPS,
  slippageInput: SLIPPAGE_OPTIONS[1],
}

function MockContextProvider({
  children,
  title,
  web3Context,
  transactions = [],
}: MockContextProviderProps) {
  const ctx = ({
    web3Context$: of(web3Context),
    context$: of({
      etherscan: { url: 'etherscan' },
    }),
    userSettings$: of(BASE_PROPS),
    accountData$: of({daiBalance: new BigNumber(1000)})
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
    <MockContextProvider title="Editing start Slippage" web3Context={protoWeb3Context}>
      <UserSettings />
    </MockContextProvider>
  )
})

stories.add('Editing', () => {
  return (
    <StoryContainer title="Editing Slippage">
      {/* <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} /> */}
    </StoryContainer>
  )
})

stories.add('In progress', () => {
  return (
    <StoryContainer title="In progress">
      {/* <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} stage="inProgress" /> */}
    </StoryContainer>
  )
})

stories.add('Failure', () => {
  return (
    <StoryContainer title="Failure">
      {/* <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} stage="failure" /> */}
    </StoryContainer>
  )
})

stories.add('Success', () => {
  return (
    <StoryContainer title="Success">
      {/* <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} stage="success" /> */}
    </StoryContainer>
  )
})
