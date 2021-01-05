import { Web3Context } from '@oasisdex/web3-context'
import { storiesOf } from '@storybook/react'
import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { ConnectWallet } from 'components/connectWallet/ConnectWallet'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import { Container, Heading } from 'theme-ui'

interface MockContextProviderProps extends WithChildren {
  web3Context: Web3Context
  title: string
}

const stories = storiesOf('ConnectWallet', module)

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

function MockContextProvider({ children, title, web3Context }: MockContextProviderProps) {
  const ctx = ({
    web3Context$: of(web3Context),
    readonlyAccount$: of(undefined),
    magicLinkConnect$: of({ email: '', messages: [], change: undefined }),
  } as any) as AppContext
  return (
    <appContext.Provider value={ctx as any}>
      <StoryContainer {...{ title }}>{children}</StoryContainer>
    </appContext.Provider>
  )
}

stories.add('Not connected', () => {
  return (
    <MockContextProvider
      title="Not Connected"
      web3Context={{
        connect: () => null,
        connectLedger: () => null,
        status: 'notConnected',
      }}
    >
      <ConnectWallet />
    </MockContextProvider>
  )
})

stories.add('Connecting', () => {
  return (
    <>
      <MockContextProvider
        title="Connecting Metamask"
        web3Context={{
          status: 'connecting',
          connectionKind: 'injected',
        }}
      >
        <ConnectWallet />
      </MockContextProvider>

      <MockContextProvider
        title="Connecting WalletConnect"
        web3Context={{
          status: 'connecting',
          connectionKind: 'walletConnect',
        }}
      >
        <ConnectWallet />
      </MockContextProvider>

      <MockContextProvider
        title="Connecting Coinbase"
        web3Context={{
          status: 'connecting',
          connectionKind: 'walletLink',
        }}
      >
        <ConnectWallet />
      </MockContextProvider>
    </>
  )
})

stories.add('Error', () => {
  return (
    <>
      <MockContextProvider
        title="Error"
        web3Context={{
          status: 'error',
          connect: () => null,
          connectLedger: () => null,
          error: {
            name: 'Some error name',
            message: 'Some error message',
          },
          deactivate: () => null,
        }}
      >
        <ConnectWallet />
      </MockContextProvider>
    </>
  )
})
