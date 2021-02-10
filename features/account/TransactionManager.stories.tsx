import { TxState, TxStatus } from '@oasisdex/transactions'
import { Web3Context } from '@oasisdex/web3-context'
import { storiesOf } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { AccountModal } from 'features/account/Account'
import { ModalProvider } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import { Container, Heading } from 'theme-ui'
import Web3 from 'web3'

import { TxData } from '../../components/AppContext'
import { AppHeader } from '../../components/Header'
import { createTransactionManager } from './transactionManager'

interface MockContextProviderProps extends WithChildren {
  web3Context?: Web3Context
  transactions?: TxState<TxData>[]
  // onrampOrders?: OnrampOrder[]
  title: string
}

const protoWeb3Context: Web3Context = {
  chainId: 42,
  status: 'connected',
  deactivate: () => null,
  account: '0xdA1810f583320Bd25BD30130fD5Db06591bEf915',
  connectionKind: 'injected',
  web3: {} as Web3,
}

const stories = storiesOf('Transaction Notifications', module)
const storiesModal = storiesOf('Transactions Modal', module)

const startTime = new Date()
startTime.setSeconds(startTime.getSeconds() - 55)

const protoTx = {
  account: '0xe6ac5629b9ade2132f42887fbbc3a3860afbd07b',
  networkId: '0',
  txNo: 2,
  start: startTime,
  lastChange: new Date(),
  dismissed: false,
  meta: {
    kind: TxMetaKind.createDsProxy,
  } as TxData,
}

const protoSignTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.WaitingForApproval,
}

const protoCancelledTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.CancelledByTheUser,
  error: new Error('error'),
}

export const protoPendingTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.WaitingForConfirmation,
  txHash: '0x123',
  broadcastedAt: new Date(),
}

const protoPropagatingTx: TxState<TxData> = protoPendingTx

const protoFailureTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.Failure,
  txHash: '0x123',
  blockNumber: 1234,
  receipt: {
    transactionHash: '0x123',
    status: false,
    blockNumber: 1234,
  },
}

const protoErrorTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.Error,
  txHash: '0x123',
  error: new Error('error'),
}

export const protoSuccessTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.Success,
  txHash: '0x123',
  blockNumber: 1234,
  receipt: {
    transactionHash: '0x123',
    status: true,
    blockNumber: 1234,
  },
  confirmations: 3,
  safeConfirmations: 1,
  meta: {
    // amount: new BigNumber(1000.41),
    kind: TxMetaKind.createDsProxy,
    // address: '0x',
  },
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

function MockContextProvider({
  transactions = [],
  web3Context,
  children,
  title,
}: MockContextProviderProps) {
  const ctx = ({
    web3Context$: web3Context ? of(web3Context) : of(protoWeb3Context),
    transactionManager$: createTransactionManager(of(transactions)),
    context$: of({
      etherscan: { url: 'etherscan' },
    }),
    dismissTransaction: () => null,
    readonlyAccount$: of(undefined),
  } as any) as AppContext
  return (
    <appContext.Provider value={ctx as any}>
      <ModalProvider>
        <StoryContainer {...{ title }}>{children}</StoryContainer>
      </ModalProvider>
    </appContext.Provider>
  )
}

stories.add('General', () => {
  return (
    <>
      <MockContextProvider title="No transactions">
        <AppHeader />
      </MockContextProvider>

      <MockContextProvider
        title="Waiting for signature"
        transactions={[protoSignTx, protoPendingTx]}
      >
        <AppHeader />
      </MockContextProvider>

      <MockContextProvider title="Propagating" transactions={[protoPropagatingTx]}>
        <AppHeader />
      </MockContextProvider>

      <MockContextProvider title="Mining/Pending" transactions={[protoPendingTx]}>
        <AppHeader />
      </MockContextProvider>

      <MockContextProvider title="Cancelled signature" transactions={[protoCancelledTx]}>
        <AppHeader />
      </MockContextProvider>

      <MockContextProvider title="Error and Pending" transactions={[protoPendingTx, protoErrorTx]}>
        <AppHeader />
      </MockContextProvider>

      <MockContextProvider title="Failure" transactions={[protoFailureTx]}>
        <AppHeader />
      </MockContextProvider>

      {/* <MockContextProvider title="Complete" transactions={[protoSuccessTx]}>
        <AppHeader />
      </MockContextProvider> */}
    </>
  )
})

storiesModal.add('View More Pending', () => {
  return (
    <>
      <MockContextProvider
        title="View More Pending"
        transactions={[protoSignTx, protoPendingTx, protoPendingTx, protoPendingTx]}
      >
        <AccountModal close={() => {}} />
      </MockContextProvider>
    </>
  )
})

storiesModal.add('View More Recent', () => {
  return (
    <>
      <MockContextProvider
        title="View More Recent"
        transactions={[protoSuccessTx, protoSuccessTx, protoSuccessTx, protoSuccessTx]}
      >
        <AccountModal close={() => {}} />
      </MockContextProvider>
    </>
  )
})

storiesModal.add('View More Both', () => {
  return (
    <>
      <MockContextProvider
        title="View More Both"
        transactions={[
          protoSignTx,
          protoPendingTx,
          protoPendingTx,
          protoPendingTx,
          protoSuccessTx,
          protoSuccessTx,
        ]}
        // onrampOrders={[]}
      >
        <AccountModal close={() => {}} />
      </MockContextProvider>
    </>
  )
})

storiesModal.add('Translations pending, recent and icons', () => {
  return (
    <>
      <MockContextProvider
        title="Translations"
        transactions={[
          protoSignTx,
          // {
          //   ...protoPendingTx,
          //   meta: { kind: TxMetaKind.transferEth, address: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoPendingTx,
          //   meta: {
          //     kind: TxMetaKind.transferErc20,
          //     address: '0x0',
          //     amount: new BigNumber(5),
          //     token: 'DAI',
          //   },
          // },
          {
            ...protoPendingTx,
            meta: { kind: TxMetaKind.disapprove, token: 'DAI', spender: '0x0' },
          },
          {
            ...protoPendingTx,
            meta: { kind: TxMetaKind.approve, token: 'DAI', spender: '0x0' },
          },
          // {
          //   ...protoPendingTx,
          //   meta: { kind: TxMetaKind.dsrExit, proxyAddress: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoPendingTx,
          //   meta: { kind: TxMetaKind.dsrJoin, proxyAddress: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoPendingTx,
          //   meta: { kind: TxMetaKind.setOwner, proxyAddress: '0x0', owner: '0x0' },
          // },
          // {
          //   ...protoSuccessTx,
          //   meta: { kind: TxMetaKind.transferEth, address: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoSuccessTx,
          //   meta: {
          //     kind: TxMetaKind.transferErc20,
          //     address: '0x0',
          //     amount: new BigNumber(5),
          //     token: 'DAI',
          //   },
          // },
          {
            ...protoSuccessTx,
            meta: { kind: TxMetaKind.disapprove, token: 'DAI', spender: '0x0' },
          },
          {
            ...protoSuccessTx,
            meta: { kind: TxMetaKind.approve, token: 'DAI', spender: '0x0' },
          },
          // {
          //   ...protoSuccessTx,
          //   meta: { kind: TxMetaKind.dsrExit, proxyAddress: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoSuccessTx,
          //   meta: { kind: TxMetaKind.dsrJoin, proxyAddress: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoSuccessTx,
          //   meta: { kind: TxMetaKind.setOwner, proxyAddress: '0x0', owner: '0x0' },
          // },
        ]}
        // onrampOrders={[]}
      >
        <AccountModal close={() => {}} />
      </MockContextProvider>
    </>
  )
})

storiesModal.add('Translations Failed', () => {
  return (
    <>
      <MockContextProvider
        title="Translations"
        transactions={[
          protoFailureTx,
          // {
          //   ...protoFailureTx,
          //   meta: { kind: TxMetaKind.transferEth, address: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoFailureTx,
          //   meta: {
          //     kind: TxMetaKind.transferErc20,
          //     address: '0x0',
          //     amount: new BigNumber(5),
          //     token: 'DAI',
          //   },
          // },
          {
            ...protoFailureTx,
            meta: { kind: TxMetaKind.disapprove, token: 'DAI', spender: '0x0' },
          },
          {
            ...protoFailureTx,
            meta: { kind: TxMetaKind.approve, token: 'DAI', spender: '0x0' },
          },
          // {
          //   ...protoFailureTx,
          //   meta: { kind: TxMetaKind.dsrExit, proxyAddress: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoFailureTx,
          //   meta: { kind: TxMetaKind.dsrJoin, proxyAddress: '0x0', amount: new BigNumber(5) },
          // },
          // {
          //   ...protoFailureTx,
          //   meta: { kind: TxMetaKind.setOwner, proxyAddress: '0x0', owner: '0x0' },
          // },
        ]}
        // onrampOrders={[]}
      >
        <AccountModal close={() => {}} />
      </MockContextProvider>
    </>
  )
})
