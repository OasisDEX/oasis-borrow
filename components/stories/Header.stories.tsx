import { TxState } from '@oasisdex/transactions'
import { Web3Context } from '@oasisdex/web3-context'
import { storiesOf } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { AppContext } from 'components/AppContext'
import { TxData } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { AppHeader } from 'components/Header'
import { SLIPPAGE_DEFAULT, UserSettingsState } from 'features/userSettings/userSettings'
import { ModalProvider } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import { Container, Heading } from 'theme-ui'
import Web3 from 'web3'

const stories = storiesOf('Header', module)

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

const userSettings: UserSettingsState = {
  stage: 'editing',
  slippage: SLIPPAGE_DEFAULT,
  slippageInput: SLIPPAGE_DEFAULT,
  setSlippageInput: () => null,
  reset: () => null,
  canProgress: true,
  errors: [],
  warnings: [],
}

function MockContextProvider({ children, title, web3Context }: MockContextProviderProps) {
  const ctx = ({
    web3Context$: of(web3Context),
    context$: of({
      etherscan: { url: 'etherscan' },
    }),
    readonlyAccount$: of(undefined),
    userSetting$: of(userSettings),
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

stories.add('Connected', () => {
  return (
    <MockContextProvider title="Connected Metamask Kovan" web3Context={protoWeb3Context}>
      <AppHeader />
    </MockContextProvider>
  )
})

stories.add('Connected WalletConnect Kovan', () => {
  return (
    <MockContextProvider
      title="Connected WalletConnect Kovan"
      web3Context={{
        ...protoWeb3Context,
        connectionKind: 'walletConnect',
      }}
    >
      <AppHeader />
    </MockContextProvider>
  )
})

stories.add('Connected Coinbase Wallet Mainnet', () => {
  return (
    <MockContextProvider
      title="Connected Coinbase Wallet Mainnet"
      web3Context={{
        ...protoWeb3Context,
        connectionKind: 'walletLink',
      }}
    >
      <AppHeader />
    </MockContextProvider>
  )
})

stories.add('Connected MagicLink Kovan', () => {
  return (
    <MockContextProvider
      title="Connected MagicLink Kovan"
      web3Context={{
        ...protoWeb3Context,
        connectionKind: 'magicLink',
      }}
    >
      <AppHeader />
    </MockContextProvider>
  )
})

stories.add('Connected Metamask Kovan', () => {
  const date = new Date()
  date.setSeconds(date.getSeconds() + 2)

  return (
    <MockContextProvider
      title="Connected Metamask Kovan"
      web3Context={protoWeb3Context}
      // transactions={[protoSuccessTx, { ...protoPendingTx, lastChange: date }]}
    >
      <AppHeader />
    </MockContextProvider>
  )
})
