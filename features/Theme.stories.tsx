import { storiesOf } from '@storybook/react'
import { Container } from 'next/app'
import { Text, Heading, Grid, Box } from 'theme-ui'
import {
  TypeScale,
  TypeStyle,
  ColorPalette,
} from '@theme-ui/style-guide'

import React from 'react'

import { theme } from '../theme'

const stories = storiesOf('Oasis Borrow Theme', module)
stories.add("Typography", () => {
  console.log(theme)

  const textStyles = Object.keys(theme.text)

  console.log(textStyles)

  return (
    <Container>
      <Heading as="h1" sx={{my: 4, fontSize: 7}}>Typography</Heading>
      <Heading sx={{mt: 4, fontSize: 5}}>Font family</Heading>
      <Grid sx={{my: 2}}>
        {
          Object.entries<[string, string]>(theme.fonts).map(([font, value]) => <Box key={font} sx={{fontFamily: font}}>{`${font}: ${value}`}</Box>)
        }
      </Grid>
      <Heading sx={{mt: 4, fontSize: 5}}>Type scale</Heading>
      <TypeScale />
      <Heading sx={{mt: 4, fontSize: 5}}>Text variants</Heading>
      <Grid sx={{my: 2}} columns="repeat(4, 1fr)" gap="10px">
        {
          textStyles.map(style => 
            <Box bg="white" p={3}>
              <Text key={style} variant={style} sx={{textTransform: 'capitalize'}}>{style}</Text>
            </Box>
          )
        }
      </Grid>
    </Container>
  )
})

stories.add("Colors", () => {
  return (
    <Container>
      <Heading as="h1" sx={{my: 4, fontSize: 5}}>Colors</Heading>
      <ColorPalette />
    </Container>
  )
})

stories.add('Theme', () => {
  return (
    <div>COŚ</div>
  )
})


// const protoWeb3Context: Web3Context = {
//   chainId: 42,
//   status: 'connected',
//   deactivate: () => null,
//   account: '0xdA1810f583320Bd25BD30130fD5Db06591bEf915',
//   connectionKind: 'injected',
//   web3: {} as Web3,
// }

// const StoryContainer = ({ children, title }: { title: string } & WithChildren) => {
//   if (!isAppContextAvailable()) return null

//   return (
//     <Container variant="appContainer">
//       <Heading variant="smallHeading" sx={{ mt: 5, mb: 3, textAlign: 'right' }}>
//         {title}
//       </Heading>
//       {children}
//     </Container>
//   )
// }

// function MockContextProvider({
//   children,
//   title,
//   web3Context,
//   transactions = [],
// }: MockContextProviderProps) {
//   const ctx = ({
//     web3Context$: of(web3Context),
//     transactionManager$: createTransactionManager(of(transactions)),
//     context$: of({
//       etherscan: { url: 'etherscan' },
//     }),
//     readonlyAccount$: of(undefined),
//   } as any) as AppContext

//   return (
//     <appContext.Provider value={ctx as any}>
//       <ModalProvider>
//         <StoryContainer {...{ title }}>{children}</StoryContainer>
//       </ModalProvider>
//     </appContext.Provider>
//   )
// }

// stories.add('Connected', () => {
//   return (
//     <MockContextProvider title="Connected Metamask Kovan" web3Context={protoWeb3Context}>
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected WalletConnect Kovan', () => {
//   return (
//     <MockContextProvider
//       title="Connected WalletConnect Kovan"
//       web3Context={{
//         ...protoWeb3Context,
//         connectionKind: 'walletConnect',
//       }}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected Coinbase wallet Mainnet', () => {
//   return (
//     <MockContextProvider
//       title="Connected Coinbase wallet Mainnet"
//       web3Context={{
//         ...protoWeb3Context,
//         connectionKind: 'walletLink',
//       }}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected MagicLink Kovan', () => {
//   return (
//     <MockContextProvider
//       title="Connected MagicLink Kovan"
//       web3Context={{
//         ...protoWeb3Context,
//         connectionKind: 'magicLink',
//       }}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected with pending transactions', () => {
//   const newTime = new Date(Date.now() + 2)

//   return (
//     <MockContextProvider
//       title="Connected Metamask Kovan"
//       web3Context={protoWeb3Context}
//       transactions={[{ ...protoPendingTx, lastChange: newTime }]}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected with recent transactions', () => {
//   return (
//     <MockContextProvider
//       title="Connected Metamask Kovan"
//       web3Context={protoWeb3Context}
//       transactions={[protoSuccessTx, protoSuccessTx]}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected with recent transactions and view more', () => {
//   return (
//     <MockContextProvider
//       title="Connected Metamask Kovan"
//       web3Context={protoWeb3Context}
//       transactions={[protoSuccessTx, protoSuccessTx, protoSuccessTx, protoSuccessTx]}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })

// stories.add('Connected with pending transaction delayed', () => {
//   const startTime = new Date()
//   const newTime = startTime.setSeconds(startTime.getSeconds() + 2)

//   return (
//     <MockContextProvider
//       title="Connected Metamask Kovan"
//       web3Context={protoWeb3Context}
//       // @ts-ignore
//       transactions={[protoSuccessTx, { ...protoPendingTx, lastChange: newTime }]}
//     >
//       <AppHeader />
//     </MockContextProvider>
//   )
// })
