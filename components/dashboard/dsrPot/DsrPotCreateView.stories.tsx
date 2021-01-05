import { storiesOf } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import { Container, Grid, Heading } from 'theme-ui'

import { DsrCreationStage, DsrCreationState } from './dsrPotCreate'
import { DsrPotCreateView } from './DsrPotCreateView'

const stories = storiesOf('DsrPotCreateView', module)

function createDsrPotCreateState(overrides: object = {}): DsrCreationState {
  return {
    stage: 'proxyWaiting4Confirmation',
    daiBalance: new BigNumber(5),
    messages: [{ kind: 'amountIsEmpty' }],
    safeConfirmations: 6,
    ...overrides,
  }
}

function StoryContainer({ children, stage }: { stage: DsrCreationStage } & WithChildren) {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Heading variant="smallHeading" sx={{ textAlign: 'center', mb: 2 }}>
        Stage: {stage}
      </Heading>
      {children}
    </Container>
  )
}

function MockContextProvider({ state, children }: { state: any } & WithChildren) {
  const ctx = ({
    dsrCreation$: of(state),
    readonlyAccount$: of(undefined),
  } as any) as AppContext

  return (
    <appContext.Provider value={ctx as any}>
      <StoryContainer stage={state.stage}>{children}</StoryContainer>
    </appContext.Provider>
  )
}

stories.add('Setup Wallet', () => {
  return (
    <Grid gap={6} mt={4}>
      <MockContextProvider
        state={createDsrPotCreateState({
          createProxy: () => null,
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'proxyWaiting4Approval',
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'proxyInProgress',
          proxyTxHash: '0x9012f6ab4e7038c7f6ed420e5e2084e285b73199d8e58e28632668464aff1ebd',
          proxyConfirmations: 3,
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'proxyFiasco',
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'allowanceWaiting4Confirmation',
          proxyAddress: '0xd1b13aAcF92Fd2Be613e5A2304CA8e957e26741E',
          setAllowance: () => null,
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'allowanceWaiting4Approval',
          proxyAddress: '0xd1b13aAcF92Fd2Be613e5A2304CA8e957e26741E',
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'allowanceInProgress',
          proxyAddress: '0xd1b13aAcF92Fd2Be613e5A2304CA8e957e26741E',
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'allowanceFiasco',
          proxyAddress: '0xd1b13aAcF92Fd2Be613e5A2304CA8e957e26741E',
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'editingWaiting4Continue',
          proxyAddress: '0xd1b13aAcF92Fd2Be613e5A2304CA8e957e26741E',
          continue2Editing: () => null,
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>
    </Grid>
  )
})

stories.add('Deposit Dai', () => {
  return (
    <Grid gap={6} mt={4}>
      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'editing',
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'editing',
          amount: new BigNumber(10),
          messages: [{ kind: 'amountBiggerThanBalance' }],
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'editing',
          amount: new BigNumber(1),
          messages: [],
          continue2ConfirmDeposit: () => null,
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>
    </Grid>
  )
})

stories.add('Confirm Deposit', () => {
  return (
    <Grid gap={6} mt={4}>
      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'depositWaiting4Confirmation',
          amount: new BigNumber(5941.77),
          deposit: () => null,
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'depositWaiting4Approval',
          amount: new BigNumber(5941.77),
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'depositInProgress',
          amount: new BigNumber(5941.77),
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'depositFiasco',
          amount: new BigNumber(5941.77),
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>

      <MockContextProvider
        state={createDsrPotCreateState({
          stage: 'depositSuccess',
          amount: new BigNumber(5941.77),
        })}
      >
        <DsrPotCreateView />
      </MockContextProvider>
    </Grid>
  )
})
