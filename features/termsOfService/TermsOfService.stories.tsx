import { storiesOf } from '@storybook/react'
import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import { Container, Heading } from 'theme-ui'

import { TermsAcceptanceState } from './termsAcceptance'
import { TermsOfService } from './TermsOfService'

interface MockContextProviderProps extends WithChildren {
  termsAcceptance: TermsAcceptanceState
  title: string
}

const stories = storiesOf('TermsOfService', module)

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

function MockContextProvider({ children, title, termsAcceptance }: MockContextProviderProps) {
  const ctx = ({
    termsAcceptance$: of(termsAcceptance),
    web3Context$: of({ deactivate: () => false }),
  } as any) as AppContext
  return (
    <appContext.Provider value={ctx as any}>
      <StoryContainer {...{ title }}>{children}</StoryContainer>
    </appContext.Provider>
  )
}

// hidden state
// stories.add('Wallet Connection in Progress', () => {
//   return (
//     <MockContextProvider
//       title="Wallet Connection in Progress"
//       termsAcceptance={{
//         stage: 'walletConnectionInProgress',
//       }}
//     >
//       <TermsOfService />
//     </MockContextProvider>
//   )
// })

// hidden state
// stories.add('Checking Acceptance', () => {
//   return (
//     <MockContextProvider
//       title="Checking Acceptance"
//       termsAcceptance={{
//         stage: 'acceptanceCheckInProgress',
//       }}
//     >
//       <TermsOfService />
//     </MockContextProvider>
//   )
// })

stories.add('Checking Acceptance Failed', () => {
  return (
    <MockContextProvider
      title="Checking Acceptance Failed"
      termsAcceptance={{
        stage: 'acceptanceCheckFailed',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('Waiting for TOS acceptance', () => {
  return (
    <MockContextProvider
      title="Waiting for TOS acceptance"
      termsAcceptance={{
        stage: 'acceptanceWaiting4TOSAcceptance',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('Waiting for TOS acceptance updated', () => {
  return (
    <MockContextProvider
      title="Waiting for TOS acceptance updated"
      termsAcceptance={{
        stage: 'acceptanceWaiting4TOSAcceptance',
        updated: true,
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('Waiting for JWT acceptance', () => {
  return (
    <MockContextProvider
      title="Waiting for JWT acceptance"
      termsAcceptance={{
        stage: 'jwtAuthWaiting4Acceptance',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('Waiting for JWT acceptance updated', () => {
  return (
    <MockContextProvider
      title="Waiting for JWT acceptance updated"
      termsAcceptance={{
        stage: 'jwtAuthWaiting4Acceptance',
        updated: true,
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('JWT acceptance in progress', () => {
  return (
    <MockContextProvider
      title="JWT acceptance in progress"
      termsAcceptance={{
        stage: 'jwtAuthInProgress',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('JWT acceptance failed', () => {
  return (
    <MockContextProvider
      title="JWT acceptance failed"
      termsAcceptance={{
        stage: 'jwtAuthFailed',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('JWT acceptance rejected', () => {
  return (
    <MockContextProvider
      title="JWT acceptance rejected"
      termsAcceptance={{
        stage: 'jwtAuthRejected',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('Acceptance save in progress', () => {
  return (
    <MockContextProvider
      title="Acceptance save in progress"
      termsAcceptance={{
        stage: 'acceptanceSaveInProgress',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

stories.add('Acceptance save failed', () => {
  return (
    <MockContextProvider
      title="Acceptance save failed"
      termsAcceptance={{
        stage: 'acceptanceSaveFailed',
      }}
    >
      <TermsOfService />
    </MockContextProvider>
  )
})

// hidden state
// stories.add('Acceptance accepted', () => {
//   return (
//     <MockContextProvider
//       title="Acceptance accepted"
//       termsAcceptance={{
//         stage: 'acceptanceAccepted',
//       }}
//     >
//       <TermsOfService />
//     </MockContextProvider>
//   )
// })
