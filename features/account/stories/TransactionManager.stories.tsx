import { TxState, TxStatus } from '@oasisdex/transactions'
import { Web3Context } from '@oasisdex/web3-context'
import { storiesOf } from '@storybook/react'
import { Container, Heading } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { AppContext, TxData } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SLIPPAGE_DEFAULT } from 'features/userSettings/userSettings'
import { ModalProvider } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { of } from 'rxjs'
import Web3 from 'web3'

// import { AccountModal } from '../Account'
import { createTransactionManager } from '../transactionManager'

interface MockContextProviderProps extends WithChildren {
  web3Context?: Web3Context
  transactions?: TxState<TxData>[]
  title: string
}

const DEFAULT_ADDRESS = '0xdA1810f583320Bd25BD30130fD5Db06591bEf915'
const DEFAULT_PROXY_ADDRESS = '0x0'

const protoWeb3Context: Web3Context = {
  chainId: 42,
  status: 'connected',
  deactivate: () => null,
  account: DEFAULT_ADDRESS,
  connectionKind: 'injected',
  web3: {} as Web3,
}

// const stories = storiesOf('Transaction Notifications', module)
const storiesModal = storiesOf('Transactions Modal', module)

const startTime = new Date()
startTime.setSeconds(startTime.getSeconds() - 55)

const protoTx = {
  account: DEFAULT_ADDRESS,
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

// const protoCancelledTx: TxState<TxData> = {
//   ...protoTx,
//   status: TxStatus.CancelledByTheUser,
//   error: new Error('error'),
// }

export const protoPendingTx: TxState<TxData> = {
  ...protoTx,
  status: TxStatus.WaitingForConfirmation,
  txHash: '0x123',
  broadcastedAt: new Date(),
}

// const protoPropagatingTx: TxState<TxData> = protoPendingTx

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

// const protoErrorTx: TxState<TxData> = {
//   ...protoTx,
//   status: TxStatus.Error,
//   txHash: '0x123',
//   error: new Error('error'),
// }

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
    kind: TxMetaKind.createDsProxy,
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
    accountData$: of({ numberofVaults: 2, daiBalance: new BigNumber(10) }),
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

const mockTxMetaDefinitions: Pick<TxState<TxData>, 'meta'>[] = [
  {
    meta: {
      kind: TxMetaKind.createDsProxy,
    },
  },
  {
    meta: {
      kind: TxMetaKind.setProxyOwner,
      owner: DEFAULT_ADDRESS,
      proxyAddress: DEFAULT_PROXY_ADDRESS,
    },
  },
  { meta: { kind: TxMetaKind.disapprove, token: 'DAI', spender: '0x0' } },
  {
    meta: {
      kind: TxMetaKind.approve,
      token: 'DAI',
      spender: '0x0',
      amount: new BigNumber(10),
    },
  },
  {
    meta: {
      kind: TxMetaKind.open,
      generateAmount: new BigNumber(3000),
      depositAmount: new BigNumber(4),
      proxyAddress: DEFAULT_PROXY_ADDRESS,
      ilk: 'ETH-A',
      token: 'ETH',
    },
  },
  {
    meta: {
      kind: TxMetaKind.depositAndGenerate,
      generateAmount: new BigNumber(3000),
      depositAmount: new BigNumber(4),
      proxyAddress: DEFAULT_PROXY_ADDRESS,
      ilk: 'ETH-A',
      token: 'ETH',
      id: new BigNumber(312),
    },
  },
  {
    meta: {
      kind: TxMetaKind.withdrawAndPayback,
      withdrawAmount: new BigNumber(4),
      paybackAmount: new BigNumber(3000),
      proxyAddress: DEFAULT_PROXY_ADDRESS!,
      ilk: 'ETH-A',
      token: 'ETH',
      id: new BigNumber(3456),
      shouldPaybackAll: true,
    },
  },
  {
    meta: {
      kind: TxMetaKind.reclaim,
      proxyAddress: DEFAULT_PROXY_ADDRESS!,
      amount: new BigNumber(4),
      token: 'ETH',
      id: new BigNumber(3456),
    },
  },
  {
    meta: {
      kind: TxMetaKind.multiply,
      proxyAddress: DEFAULT_PROXY_ADDRESS,
      token: 'ETH',
      userAddress: '0x',
      depositCollateral: new BigNumber(4),
      borrowedCollateral: new BigNumber(1),
      requiredDebt: new BigNumber(4000),
      ilk: 'ETH-A',
      fromTokenAmount: new BigNumber(3),
      toTokenAmount: new BigNumber(3),
      exchangeData: '0x',
      exchangeAddress: '0x',
      skipFL: false,
    },
  },
  {
    meta: {
      kind: TxMetaKind.adjustPosition,
      proxyAddress: DEFAULT_PROXY_ADDRESS,
      token: 'ETH',
      userAddress: '0x',
      depositCollateral: new BigNumber(4),
      depositDai: new BigNumber(0),
      withdrawDai: new BigNumber(0),
      withdrawCollateral: new BigNumber(0),
      borrowedCollateral: new BigNumber(1),
      requiredDebt: new BigNumber(4000),
      ilk: 'ETH-A',
      exchangeData: '0x',
      exchangeAddress: '0x',
      slippage: SLIPPAGE_DEFAULT,
      action: 'BUY_COLLATERAL',
      id: new BigNumber(3456),
    },
  },
  {
    meta: {
      kind: TxMetaKind.closeVault,
      proxyAddress: DEFAULT_PROXY_ADDRESS,
      token: 'ETH',
      userAddress: '0x',
      ilk: 'ETH-A',
      totalCollateral: new BigNumber(4),
      totalDebt: new BigNumber(4000),
      fromTokenAmount: new BigNumber(4),
      toTokenAmount: new BigNumber(4500),
      minToTokenAmount: new BigNumber(4000),
      exchangeData: '0x',
      exchangeAddress: '0x',
      id: new BigNumber(3456),
      closeTo: 'dai',
    },
  },
]

storiesModal.add('Translations pending, recent and icons', () => {
  return (
    <>
      <MockContextProvider
        title="Translations"
        transactions={[
          // show sign
          protoSignTx,
          // show all pending
          ...mockTxMetaDefinitions.map((mockMeta) => ({
            ...protoPendingTx,
            ...mockMeta,
          })),
          // show all success
          ...mockTxMetaDefinitions.map((mockMeta) => ({
            ...protoSuccessTx,
            ...mockMeta,
          })),
        ]}
      >
        {/* <AccountModal close={() => {}} /> */}
      </MockContextProvider>
    </>
  )
})

storiesModal.add('Translations Failed', () => {
  return (
    <>
      <MockContextProvider
        title="Translations"
        transactions={
          // show all failures
          mockTxMetaDefinitions.map((mockMeta) => ({
            ...protoFailureTx,
            ...mockMeta,
          }))
        }
      >
        {/* <AccountModal close={() => {}} /> */}
      </MockContextProvider>
    </>
  )
})

//
// stories.add('General', () => {
//   return (
//     <>
//       <MockContextProvider title="No transactions">
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider
//         title="Waiting for signature"
//         transactions={[protoSignTx, protoPendingTx]}
//       >
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider title="Propagating" transactions={[protoPropagatingTx]}>
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider title="Mining/Pending" transactions={[protoPendingTx]}>
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider title="Cancelled signature" transactions={[protoCancelledTx]}>
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider title="Error and Pending" transactions={[protoPendingTx, protoErrorTx]}>
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider title="Failure" transactions={[protoFailureTx]}>
//         <AppHeader />
//       </MockContextProvider>
//
//       <MockContextProvider title="Complete" transactions={[protoSuccessTx]}>
//         <AppHeader />
//       </MockContextProvider>
//     </>
//   )
// })
//
//

//
// storiesModal.add('View More Pending', () => {
//   return (
//     <>
//       <MockContextProvider
//         title="View More Pending"
//         transactions={[protoSignTx, protoPendingTx, protoPendingTx, protoPendingTx]}
//       >
//         <AccountModal close={() => {}} />
//       </MockContextProvider>
//     </>
//   )
// })
//
// storiesModal.add('View More Recent', () => {
//   return (
//     <>
//       <MockContextProvider
//         title="View More Recent"
//         transactions={[protoSuccessTx, protoSuccessTx, protoSuccessTx, protoSuccessTx]}
//       >
//         <AccountModal close={() => {}} />
//       </MockContextProvider>
//     </>
//   )
// })
//
// storiesModal.add('View More Both', () => {
//   return (
//     <>
//       <MockContextProvider
//         title="View More Both"
//         transactions={[
//           protoSignTx,
//           protoPendingTx,
//           protoPendingTx,
//           protoPendingTx,
//           protoSuccessTx,
//           protoSuccessTx,
//         ]}
//       >
//         <AccountModal close={() => {}} />
//       </MockContextProvider>
//     </>
//   )
// })
//
